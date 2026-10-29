import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { addDays, toISODate } from '../../core/dates';
import { MAX_GUESTS, MIN_DAYS_AHEAD, TOURS } from '../../core/models';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { QuantityInputComponent } from '../../shared/quantity-input.component';
import { BookingForm } from '../booking-form';

@Component({
  selector: 'app-trip-step',
  imports: [ReactiveFormsModule, CurrencyPipe, QuantityInputComponent, FieldErrorComponent],
  template: `
    @let g = group();
    <div [formGroup]="g" class="space-y-8">
      <fieldset>
        <legend class="step-label">Choose your tour</legend>
        <div class="grid gap-3 sm:grid-cols-2">
          @for (tour of tours; track tour.id) {
            <label
              class="flex cursor-pointer gap-3 rounded-2xl border-2 bg-white p-4 transition hover:border-teal-300
                has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50 border-slate-200"
            >
              <input type="radio" formControlName="tourId" [value]="tour.id" class="sr-only" />
              <span class="text-3xl" aria-hidden="true">{{ tour.emoji }}</span>
              <span class="flex-1">
                <span class="block font-semibold">{{ tour.name }}</span>
                <span class="block text-sm text-slate-500">{{ tour.location }} · {{ tour.days }}D{{ tour.nights }}N</span>
                <span class="mt-1 block text-sm text-slate-600">{{ tour.summary }}</span>
                <span class="mt-2 block text-sm font-semibold text-teal-700">
                  {{ tour.pricePerAdult | currency: 'VND' }} <span class="font-normal text-slate-500">/ adult</span>
                </span>
              </span>
            </label>
          }
        </div>
        <app-field-error [control]="g.controls.tourId" />
      </fieldset>

      <label class="block max-w-xs">
        <span class="step-label">Departure date</span>
        <input type="date" formControlName="departure" [min]="minDate" class="field" />
        <span class="mt-1 block text-xs text-slate-500">At least {{ minDays }} days from today.</span>
        <app-field-error [control]="g.controls.departure" />
      </label>

      <div class="flex flex-wrap gap-8">
        <div>
          <span class="step-label">Adults <span class="font-normal text-slate-500">(18+)</span></span>
          <app-quantity-input formControlName="adults" [min]="1" [max]="8" label="adults" />
        </div>
        <div>
          <span class="step-label">Children <span class="font-normal text-slate-500">(2–17, 70% price)</span></span>
          <app-quantity-input formControlName="children" [min]="0" [max]="6" label="children" />
        </div>
      </div>
      @if (g.hasError('maxGuests')) {
        <p class="text-sm text-rose-600" role="alert">A group can have at most {{ maxGuests }} people.</p>
      }
    </div>
  `,
})
export class TripStepComponent {
  readonly group = input.required<BookingForm['controls']['trip']>();

  protected readonly tours = TOURS;
  protected readonly minDays = MIN_DAYS_AHEAD;
  protected readonly maxGuests = MAX_GUESTS;
  protected readonly minDate = toISODate(addDays(new Date(), MIN_DAYS_AHEAD));
}
