import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ADDONS, ADDON_KEYS, ROOMS, ROOM_TYPES, Tour } from '../../core/models';
import { roomsNeeded } from '../../core/pricing';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { BookingForm } from '../booking-form';

@Component({
  selector: 'app-extras-step',
  imports: [ReactiveFormsModule, CurrencyPipe, FieldErrorComponent],
  template: `
    @let g = group();
    <div [formGroup]="g" class="space-y-8">
      <fieldset>
        <legend class="step-label">Room</legend>
        @if (tour()?.nights) {
          <p class="mb-3 text-sm text-slate-500">
            {{ rooms() }} room(s) for {{ tour()!.nights }} night(s) — two adults per room.
          </p>
        }
        <div class="grid gap-3 sm:grid-cols-3">
          @for (type of roomTypes; track type) {
            <label
              class="cursor-pointer rounded-2xl border-2 border-slate-200 bg-white p-4 transition hover:border-teal-300
                has-[:checked]:border-teal-600 has-[:checked]:bg-teal-50"
            >
              <input type="radio" formControlName="room" [value]="type" class="sr-only" />
              <span class="block font-semibold">{{ roomInfo[type].label }}</span>
              <span class="mt-1 block text-sm text-slate-500">{{ roomInfo[type].description }}</span>
              <span class="mt-2 block text-sm font-semibold text-teal-700">
                @if (roomInfo[type].perNight) {
                  + {{ roomInfo[type].perNight | currency: 'VND' }} / room / night
                } @else {
                  Included
                }
              </span>
            </label>
          }
        </div>
      </fieldset>

      <fieldset>
        <legend class="step-label">Add-ons</legend>
        <div class="space-y-2">
          @for (key of addonKeys; track key) {
            <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-teal-300">
              <input type="checkbox" [formControlName]="key" class="size-4 accent-teal-600" />
              <span class="flex-1">{{ addons[key].label }}</span>
              <span class="text-sm text-slate-600">
                {{ addons[key].price | currency: 'VND' }}{{ addons[key].perPerson ? ' / person' : '' }}
              </span>
            </label>
          }
        </div>
      </fieldset>

      <label class="block">
        <span class="step-label">Special requests <span class="font-normal text-slate-500">(optional)</span></span>
        <textarea formControlName="requests" rows="3" class="field resize-y" placeholder="Dietary needs, accessibility, celebrations…"></textarea>
        <span class="mt-1 block text-right text-xs text-slate-500">{{ g.controls.requests.value.length }}/300</span>
        <app-field-error [control]="g.controls.requests" />
      </label>
    </div>
  `,
})
export class ExtrasStepComponent {
  readonly group = input.required<BookingForm['controls']['extras']>();
  readonly tour = input<Tour | null>(null);
  readonly adults = input(1);

  protected readonly roomTypes = ROOM_TYPES;
  protected readonly roomInfo = ROOMS;
  protected readonly addonKeys = ADDON_KEYS;
  protected readonly addons = ADDONS;

  protected rooms(): number {
    return roomsNeeded(this.adults());
  }
}
