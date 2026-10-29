import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, filter, firstValueFrom, map, merge } from 'rxjs';
import { BookingApiService } from '../core/booking-api.service';
import { CouponService, findCoupon } from '../core/coupon.service';
import { DraftService } from '../core/draft.service';
import { TravellerType, findTour } from '../core/models';
import { calculatePrice } from '../core/pricing';
import { CanLeave } from '../core/unsaved-changes.guard';
import { BookingValue, TravellerValue, createBookingForm, createTraveller } from './booking-form';
import { ExtrasStepComponent } from './steps/extras-step.component';
import { ReviewStepComponent } from './steps/review-step.component';
import { TravellersStepComponent } from './steps/travellers-step.component';
import { TripStepComponent } from './steps/trip-step.component';

export const STEPS = [
  { title: 'Tour', hint: 'Where and when' },
  { title: 'Travellers', hint: 'Who is going' },
  { title: 'Extras', hint: 'Room and add-ons' },
  { title: 'Review', hint: 'Check and confirm' },
] as const;

@Component({
  selector: 'app-booking',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, TripStepComponent, TravellersStepComponent, ExtrasStepComponent, ReviewStepComponent],
  templateUrl: './booking.component.html',
})
export class BookingComponent implements CanLeave {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(BookingApiService);
  private readonly drafts = inject(DraftService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = createBookingForm(this.fb, inject(CouponService));
  protected readonly steps = STEPS;

  protected readonly step = signal(0);
  /** Furthest step reached — the stepper lets you jump back, never ahead. */
  protected readonly maxVisited = signal(0);
  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly draftRestored = signal(false);
  private submitted = false;

  /** The form's value as a signal, refreshed on every value AND status change (async coupon check). */
  protected readonly value = toSignal(
    merge(this.form.valueChanges, this.form.statusChanges).pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  protected readonly tour = computed(() => findTour(this.value().trip.tourId));

  protected readonly price = computed(() => {
    const v = this.value();
    const coupon = this.form.controls.review.controls.coupon;
    return calculatePrice({
      tour: this.tour(),
      adults: v.trip.adults,
      children: v.trip.children,
      room: v.extras.room,
      addons: { pickup: v.extras.pickup, insurance: v.extras.insurance, photographer: v.extras.photographer },
      coupon: coupon.valid && v.review.coupon ? findCoupon(v.review.coupon) : null,
    });
  });

  constructor() {
    const trip = this.form.controls.trip.controls;

    // Keep one traveller form per person
    merge(trip.adults.valueChanges, trip.children.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.syncTravellers());
    this.syncTravellers();

    // Ages are checked against the departure date, so re-check them when it changes
    trip.departure.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      for (const t of this.form.controls.travellers.controls) t.controls.dateOfBirth.updateValueAndValidity();
    });

    this.restoreDraft();

    // Autosave half a second after the user stops typing
    this.form.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed())
      .subscribe(() => {
        if (!this.submitted) this.drafts.save(this.form.getRawValue(), this.step());
      });
  }

  // ---------- Navigation ----------

  /** The form groups that belong to each step. */
  private groupsFor(step: number): AbstractControl[] {
    const c = this.form.controls;
    const byStep: AbstractControl[][] = [[c.trip], [c.travellers, c.contact], [c.extras], [c.review]];
    return byStep[step] ?? [];
  }

  private isStepValid(step: number): boolean {
    return this.groupsFor(step).every((g) => g.valid);
  }

  /** Index of the first step with errors, or null if everything is valid. */
  private firstInvalidStep(): number | null {
    const index = this.steps.findIndex((_, i) => !this.isStepValid(i));
    return index === -1 ? null : index;
  }

  protected next(): void {
    const current = this.step();
    if (!this.isStepValid(current)) {
      this.groupsFor(current).forEach((g) => g.markAllAsTouched());
      this.focusFirstError();
      return;
    }
    this.goTo(current + 1, true);
  }

  protected back(): void {
    this.goTo(this.step() - 1);
  }

  protected goTo(step: number, allowForward = false): void {
    if (step < 0 || step >= this.steps.length) return;
    if (!allowForward && step > this.maxVisited()) return;
    this.step.set(step);
    this.maxVisited.update((max) => Math.max(max, step));
    this.drafts.save(this.form.getRawValue(), step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Submit ----------

  protected async submit(): Promise<void> {
    // Pressing Enter in a field submits the <form>: before the last step, treat it as "Continue"
    if (this.step() < this.steps.length - 1) {
      this.next();
      return;
    }

    // The coupon is checked on blur — clicking "Confirm" may have just started that check
    if (this.form.pending) {
      await firstValueFrom(this.form.statusChanges.pipe(filter((status) => status !== 'PENDING')));
    }

    const invalid = this.firstInvalidStep();
    if (invalid !== null) {
      this.groupsFor(invalid).forEach((g) => g.markAllAsTouched());
      if (invalid !== this.step()) this.step.set(invalid);
      this.focusFirstError();
      return;
    }

    const v = this.form.getRawValue();
    this.submitting.set(true);
    this.submitError.set(null);

    this.api
      .submit({
        tourName: this.tour()?.name ?? '',
        departure: v.trip.departure,
        travellers: v.travellers.map(({ type, fullName }) => ({ type, fullName })),
        email: v.contact.email,
        phone: v.contact.phone,
        price: this.price(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (booking) => {
          this.submitted = true;
          this.drafts.clear();
          void this.router.navigate(['/confirmation', booking.code]);
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set("We couldn't confirm your booking. Nothing was charged — please try again.");
        },
      });
  }

  // ---------- Draft ----------

  protected startOver(): void {
    this.drafts.clear();
    this.form.reset(); // back to the initial values (2 adults, 0 children…)
    this.syncTravellers();
    this.step.set(0);
    this.maxVisited.set(0);
    this.draftRestored.set(false);
  }

  private restoreDraft(): void {
    const draft = this.drafts.load<BookingValue>();
    if (!draft) return;

    const { trip, travellers, contact, extras, review } = draft.value;
    this.form.controls.trip.patchValue(trip); // triggers syncTravellers → right number of traveller forms
    this.form.controls.travellers.patchValue(travellers);
    this.form.controls.contact.patchValue(contact);
    this.form.controls.extras.patchValue(extras);
    this.form.controls.review.patchValue({ coupon: review?.coupon ?? '' }); // terms must be ticked again

    // Resume where the user was, unless an earlier step is no longer valid (e.g. the date is now too close)
    const firstInvalid = this.firstInvalidStep();
    const step = Math.min(draft.step, firstInvalid ?? draft.step);
    this.step.set(step);
    this.maxVisited.set(draft.step);
    this.draftRestored.set(true);
  }

  // ---------- Helpers ----------

  /** Rebuilds the travellers FormArray to match the adult/child counts, keeping what was already typed. */
  private syncTravellers(): void {
    const { adults, children } = this.form.controls.trip.getRawValue();
    const array = this.form.controls.travellers;
    const current = array.getRawValue();
    const ofType = (type: TravellerType) => current.filter((t) => t.type === type);
    const existingAdults = ofType('adult');
    const existingChildren = ofType('child');
    if (existingAdults.length === adults && existingChildren.length === children) return;

    const getDeparture = () => this.form.controls.trip.controls.departure.value;
    const build = (type: TravellerType, count: number, existing: TravellerValue[]) =>
      Array.from({ length: Math.max(0, count) }, (_, i) => createTraveller(this.fb, type, getDeparture, existing[i]));

    array.clear({ emitEvent: false });
    for (const group of [...build('adult', adults, existingAdults), ...build('child', children, existingChildren)]) {
      array.push(group, { emitEvent: false });
    }
    array.updateValueAndValidity(); // one change event for the whole rebuild
  }

  private focusFirstError(): void {
    // Wait for the error messages to render, then move focus to the first invalid field
    setTimeout(() => document.querySelector<HTMLElement>('form .ng-invalid:not(form):not(fieldset):not([formarrayname]):not([formgroupname])')?.focus());
  }

  /** Called by unsavedChangesGuard when navigating away. */
  canLeave(): boolean {
    if (this.submitted || this.form.pristine) return true;
    return window.confirm('Leave the booking? Your progress is saved as a draft and will be here when you come back.');
  }
}
