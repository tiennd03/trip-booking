import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { findCoupon } from '../../core/coupon.service';
import { ADDONS, ADDON_KEYS, ROOMS, Tour } from '../../core/models';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { BookingForm, BookingValue } from '../booking-form';

@Component({
  selector: 'app-review-step',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, FieldErrorComponent],
  template: `
    @let v = value();
    @let g = group();
    <div class="space-y-6">
      <section class="review-card">
        <header class="flex items-center justify-between">
          <h3 class="font-semibold">Tour</h3>
          <button type="button" class="edit-link" (click)="edit.emit(0)">Edit</button>
        </header>
        <p>{{ tour()?.emoji }} {{ tour()?.name }}</p>
        <p class="text-sm text-slate-500">
          Departs {{ v.trip.departure | date: 'EEEE, d MMM y' }} · {{ v.trip.adults }} adult(s), {{ v.trip.children }} child(ren)
        </p>
      </section>

      <section class="review-card">
        <header class="flex items-center justify-between">
          <h3 class="font-semibold">Travellers & contact</h3>
          <button type="button" class="edit-link" (click)="edit.emit(1)">Edit</button>
        </header>
        <ul class="text-sm">
          @for (t of v.travellers; track $index) {
            <li>{{ t.fullName }} <span class="text-slate-500">· {{ t.type }} · born {{ t.dateOfBirth | date: 'd MMM y' }}</span></li>
          }
        </ul>
        <p class="mt-2 text-sm text-slate-500">{{ v.contact.email }} · {{ v.contact.phone }}</p>
      </section>

      <section class="review-card">
        <header class="flex items-center justify-between">
          <h3 class="font-semibold">Room & extras</h3>
          <button type="button" class="edit-link" (click)="edit.emit(2)">Edit</button>
        </header>
        <p class="text-sm">{{ rooms[v.extras.room].label }} room</p>
        @for (key of addonKeys; track key) {
          @if (v.extras[key]) {
            <p class="text-sm">+ {{ addons[key].label }}</p>
          }
        }
        @if (v.extras.requests) {
          <p class="mt-2 text-sm italic text-slate-500">"{{ v.extras.requests }}"</p>
        }
      </section>

      <div [formGroup]="g" class="space-y-4">
        <label class="block max-w-sm">
          <span class="field-label">Coupon code <span class="font-normal text-slate-500">(try WELCOME10)</span></span>
          <input formControlName="coupon" class="field uppercase" autocomplete="off" />
          @if (g.controls.coupon.pending) {
            <span class="mt-1 block text-sm text-slate-500">Checking…</span>
          } @else if (appliedCoupon(); as c) {
            <span class="mt-1 block text-sm text-teal-700">✓ {{ c.label }}</span>
          }
          <app-field-error [control]="g.controls.coupon" />
        </label>

        <label class="flex items-start gap-3">
          <input type="checkbox" formControlName="terms" class="mt-1 size-4 accent-teal-600" />
          <span class="text-sm">I agree to the booking terms and the cancellation policy (free cancellation up to 7 days before departure).</span>
        </label>
        @if (g.controls.terms.touched && g.controls.terms.invalid) {
          <p class="text-sm text-rose-600" role="alert">Please accept the terms to confirm your booking.</p>
        }
      </div>
    </div>
  `,
})
export class ReviewStepComponent {
  readonly value = input.required<BookingValue>();
  readonly group = input.required<BookingForm['controls']['review']>();
  readonly tour = input<Tour | null>(null);
  /** Asks the parent to jump back to a step. */
  readonly edit = output<number>();

  protected readonly rooms = ROOMS;
  protected readonly addons = ADDONS;
  protected readonly addonKeys = ADDON_KEYS;

  protected appliedCoupon() {
    const control = this.group().controls.coupon;
    return control.valid && control.value ? findCoupon(control.value) : null;
  }
}
