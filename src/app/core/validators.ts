import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, map, of } from 'rxjs';
import { CouponService } from './coupon.service';
import { addDays, ageOn, parseISODate, toISODate } from './dates';
import { TravellerType } from './models';

// A validator is a function: control → null (valid) or an errors object (invalid).
// "Factory" validators take settings and RETURN that function, like Validators.min(1).

/** The date must be at least `days` days from today. `today` is a parameter so tests can fix the date. */
export function minDaysFromToday(days: number, today: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    if (!control.value) return null; // empty is Validators.required's job
    const date = parseISODate(control.value);
    const min = addDays(today(), days);
    if (!date) return { date: true };
    return date < min ? { minDate: { min: toISODate(min) } } : null;
  };
}

/** Group validator: adults + children may not exceed `max`. Attached to the trip FormGroup. */
export function maxGuests(max: number): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const adults = Number(group.get('adults')?.value ?? 0);
    const children = Number(group.get('children')?.value ?? 0);
    const actual = adults + children;
    return actual > max ? { maxGuests: { max, actual } } : null;
  };
}

/**
 * Age rules on the DEPARTURE date: adults 18+, children 2–17.
 * `getDeparture` is read each time the validator runs, so it always uses the current departure date.
 */
export function ageOnDeparture(type: TravellerType, getDeparture: () => string): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const birth = parseISODate(control.value ?? '');
    if (!birth) return null;
    const today = new Date();
    if (birth > today) return { futureDate: true };

    const departure = parseISODate(getDeparture()) ?? today;
    const age = ageOn(birth, departure);
    if (type === 'adult' && age < 18) return { adultAge: { age } };
    if (type === 'child' && (age < 2 || age > 17)) return { childAge: { age } };
    return null;
  };
}

/** Vietnamese mobile numbers: 0 or +84, then 3/5/7/8/9 and 8 digits. Spaces, dots and dashes are allowed. */
export function vnPhone(control: AbstractControl<string>): ValidationErrors | null {
  if (!control.value) return null;
  const digits = control.value.replace(/[\s.-]/g, '');
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(digits) ? null : { phone: true };
}

/** Letters (any language, including Vietnamese), spaces, apostrophes, dots and hyphens; 2–60 characters. */
export const NAME_PATTERN = /^[\p{L}\s'.-]{2,60}$/u;

/** Async validator: asks CouponService whether the code exists. Empty = valid (the coupon is optional). */
export function couponValidator(coupons: CouponService): AsyncValidatorFn {
  return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
    if (!control.value?.trim()) return of(null);
    return coupons.check(control.value).pipe(map((coupon) => (coupon ? null : { invalidCoupon: true })));
  };
}
