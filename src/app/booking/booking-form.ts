import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { CouponService } from '../core/coupon.service';
import { MAX_GUESTS, MIN_DAYS_AHEAD, RoomType, TravellerType } from '../core/models';
import { NAME_PATTERN, ageOnDeparture, couponValidator, maxGuests, minDaysFromToday, vnPhone } from '../core/validators';

export type TravellerForm = FormGroup<{
  type: FormControl<TravellerType>;
  fullName: FormControl<string>;
  dateOfBirth: FormControl<string>;
}>;

export interface TravellerValue {
  type: TravellerType;
  fullName: string;
  dateOfBirth: string;
}

/**
 * The whole booking is ONE typed FormGroup with a nested group per step.
 * Keeping it in one place means: one value to autosave, one validity check before submit,
 * and every step component just receives the piece it needs.
 */
export function createBookingForm(fb: NonNullableFormBuilder, coupons: CouponService) {
  return fb.group({
    trip: fb.group(
      {
        tourId: ['', Validators.required],
        departure: ['', [Validators.required, minDaysFromToday(MIN_DAYS_AHEAD)]],
        adults: [2, [Validators.required, Validators.min(1), Validators.max(8)]],
        children: [0, [Validators.min(0), Validators.max(6)]],
      },
      { validators: maxGuests(MAX_GUESTS) }, // a rule that needs two fields goes on their group
    ),
    // One entry per traveller — rebuilt whenever the number of adults/children changes
    travellers: fb.array<TravellerForm>([]),
    contact: fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, vnPhone]],
    }),
    extras: fb.group({
      room: fb.control<RoomType>('standard'),
      pickup: [false],
      insurance: [false],
      photographer: [false],
      requests: ['', Validators.maxLength(300)],
    }),
    review: fb.group({
      // updateOn 'blur': check the coupon with the "server" once the user leaves the field, not on every key
      coupon: fb.control('', { asyncValidators: couponValidator(coupons), updateOn: 'blur' }),
      terms: [false, Validators.requiredTrue],
    }),
  });
}

export type BookingForm = ReturnType<typeof createBookingForm>;
export type BookingValue = ReturnType<BookingForm['getRawValue']>;

export function createTraveller(
  fb: NonNullableFormBuilder,
  type: TravellerType,
  getDeparture: () => string,
  value?: Partial<TravellerValue>,
): TravellerForm {
  return fb.group({
    type: fb.control<TravellerType>(type),
    fullName: [value?.fullName ?? '', [Validators.required, Validators.pattern(NAME_PATTERN)]],
    dateOfBirth: [value?.dateOfBirth ?? '', [Validators.required, ageOnDeparture(type, getDeparture)]],
  });
}
