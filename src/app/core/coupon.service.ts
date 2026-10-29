import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Coupon } from './models';

const COUPONS: Coupon[] = [
  { code: 'WELCOME10', label: '10% off your first trip', percent: 10 },
  { code: 'SAVE200K', label: '200,000₫ off', amount: 200_000 },
];

/** Case-insensitive lookup, ignoring spaces around the code. */
export function findCoupon(code: string): Coupon | null {
  const normalized = code.trim().toUpperCase();
  return COUPONS.find((c) => c.code === normalized) ?? null;
}

/** Pretends to ask a server whether a coupon exists (600 ms delay), like a real API call would. */
@Injectable({ providedIn: 'root' })
export class CouponService {
  check(code: string): Observable<Coupon | null> {
    return of(findCoupon(code)).pipe(delay(600));
  }
}
