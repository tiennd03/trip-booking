import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CHILD_RATE, MAX_GUESTS, MIN_DAYS_AHEAD, TOURS } from '../core/models';

@Component({
  selector: 'app-how-it-works',
  imports: [RouterLink, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="mx-auto max-w-2xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="text-2xl font-bold">How booking works</h1>
      <ol class="list-decimal space-y-2 pl-5 text-slate-700">
        <li>Pick a tour and a departure date at least {{ minDays }} days ahead.</li>
        <li>Add every traveller — up to {{ maxGuests }} people per booking. Children (2–17) pay {{ childPercent }}% of the adult price.</li>
        <li>Choose a room and optional extras. The price updates as you go.</li>
        <li>Review, add a coupon if you have one, and confirm. Free cancellation up to 7 days before departure.</li>
      </ol>

      <h2 class="pt-2 text-lg font-semibold">Tours</h2>
      <ul class="divide-y divide-slate-200">
        @for (t of tours; track t.id) {
          <li class="flex justify-between gap-4 py-2 text-sm">
            <span>{{ t.emoji }} {{ t.name }} · {{ t.days }}D{{ t.nights }}N</span>
            <span class="font-medium">{{ t.pricePerAdult | currency: 'VND' }}</span>
          </li>
        }
      </ul>

      <a routerLink="/" class="btn-primary">Back to booking</a>
    </article>
  `,
})
export class HowItWorksComponent {
  protected readonly tours = TOURS;
  protected readonly minDays = MIN_DAYS_AHEAD;
  protected readonly maxGuests = MAX_GUESTS;
  protected readonly childPercent = CHILD_RATE * 100;
}
