import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, switchMap, tap, throwError, timer } from 'rxjs';
import { PriceBreakdown } from './models';

export interface BookingRequest {
  tourName: string;
  departure: string;
  travellers: Array<{ type: string; fullName: string }>;
  email: string;
  phone: string;
  price: PriceBreakdown;
}

export interface BookingConfirmation extends BookingRequest {
  code: string;
}

/**
 * Fake backend: waits 1.2 s and returns a booking code.
 * Tip for testing the error message: use an email ending in "@fail.test".
 */
@Injectable({ providedIn: 'root' })
export class BookingApiService {
  /** The last confirmed booking, shown on the confirmation page. */
  readonly lastBooking = signal<BookingConfirmation | null>(null);

  submit(request: BookingRequest): Observable<BookingConfirmation> {
    if (request.email.toLowerCase().endsWith('@fail.test')) {
      // delay() only delays values, not errors — so wait first, then fail
      return timer(1200).pipe(switchMap(() => throwError(() => new Error('Payment provider unavailable'))));
    }
    const confirmation: BookingConfirmation = { ...request, code: createBookingCode() };
    return of(confirmation).pipe(
      delay(1200),
      tap((booking) => this.lastBooking.set(booking)),
    );
  }
}

/** e.g. "WND-7K2Q9X" — no 0/O or 1/I so it's easy to read over the phone. */
export function createBookingCode(random: () => number = Math.random): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet[Math.floor(random() * alphabet.length)];
  return `WND-${code}`;
}
