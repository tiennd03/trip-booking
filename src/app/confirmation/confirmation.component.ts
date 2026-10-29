import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingApiService } from '../core/booking-api.service';

@Component({
  selector: 'app-confirmation',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p class="text-5xl">🎉</p>
      <h1 class="mt-4 text-2xl font-bold">Booking confirmed</h1>
      <p class="mt-2 text-slate-600">Your booking code is</p>
      <p class="mt-2 inline-block rounded-xl bg-teal-50 px-4 py-2 font-mono text-2xl font-bold tracking-widest text-teal-800">{{ code() }}</p>

      @if (booking(); as b) {
        <dl class="mt-8 space-y-2 text-left text-sm">
          <div class="flex justify-between"><dt class="text-slate-500">Tour</dt><dd class="font-medium">{{ b.tourName }}</dd></div>
          <div class="flex justify-between"><dt class="text-slate-500">Departure</dt><dd class="font-medium">{{ b.departure | date: 'EEEE, d MMM y' }}</dd></div>
          <div class="flex justify-between"><dt class="text-slate-500">Travellers</dt><dd class="font-medium">{{ b.travellers.length }}</dd></div>
          <div class="flex justify-between"><dt class="text-slate-500">Total paid</dt><dd class="font-semibold">{{ b.price.total | currency: 'VND' }}</dd></div>
        </dl>
        <p class="mt-6 text-sm text-slate-500">A confirmation was sent to {{ b.email }}.</p>
      } @else {
        <!-- Opened by link or after a reload: the details live only in memory in this demo -->
        <p class="mt-6 text-sm text-slate-500">Keep this code for your records.</p>
      }

      <a routerLink="/" class="btn-primary mt-8 inline-flex">Book another trip</a>
      <p class="mt-6 text-xs text-slate-400">Demo project — no real booking or payment was made.</p>
    </div>
  `,
})
export class ConfirmationComponent {
  /** From the route /confirmation/:code */
  readonly code = input.required<string>();
  private readonly api = inject(BookingApiService);

  /** Only show details if they belong to this code (not a stale booking from earlier). */
  protected readonly booking = computed(() => {
    const last = this.api.lastBooking();
    return last?.code === this.code() ? last : null;
  });
}
