import { FormControl, FormGroup } from '@angular/forms';
import { fakeAsync, tick } from '@angular/core/testing';
import { CouponService } from './coupon.service';
import { NAME_PATTERN, ageOnDeparture, couponValidator, maxGuests, minDaysFromToday, vnPhone } from './validators';

describe('validators', () => {
  describe('minDaysFromToday', () => {
    const today = () => new Date(2026, 9, 27); // 27 Oct 2026
    const validator = minDaysFromToday(3, today);

    it('accepts a date 3 or more days ahead', () => {
      expect(validator(new FormControl('2026-10-30'))).toBeNull();
    });

    it('rejects a date that is too soon, and says the earliest allowed', () => {
      expect(validator(new FormControl('2026-10-29'))).toEqual({ minDate: { min: '2026-10-30' } });
    });

    it('leaves empty values to Validators.required', () => {
      expect(validator(new FormControl(''))).toBeNull();
    });
  });

  it('maxGuests checks the sum of two controls', () => {
    const group = new FormGroup({ adults: new FormControl(6), children: new FormControl(5) }, { validators: maxGuests(10) });
    expect(group.errors).toEqual({ maxGuests: { max: 10, actual: 11 } });
    group.controls.children.setValue(4);
    expect(group.errors).toBeNull();
  });

  describe('ageOnDeparture', () => {
    const departure = () => '2026-12-01';

    it('requires adults to be 18 on the departure date', () => {
      const adult = ageOnDeparture('adult', departure);
      expect(adult(new FormControl('2008-12-01'))).toBeNull(); // turns 18 that day
      expect(adult(new FormControl('2008-12-02'))).toEqual({ adultAge: { age: 17 } });
    });

    it('requires children to be between 2 and 17', () => {
      const child = ageOnDeparture('child', departure);
      expect(child(new FormControl('2015-01-01'))).toBeNull();
      expect(child(new FormControl('2025-06-01'))).toEqual({ childAge: { age: 1 } });
      expect(child(new FormControl('2000-01-01'))).toEqual({ childAge: { age: 26 } });
    });

    it('rejects birth dates in the future', () => {
      expect(ageOnDeparture('adult', departure)(new FormControl('2999-01-01'))).toEqual({ futureDate: true });
    });
  });

  describe('vnPhone', () => {
    it('accepts Vietnamese mobile formats', () => {
      for (const phone of ['0912345678', '0912 345 678', '+84912345678', '091.234.5678']) {
        expect(vnPhone(new FormControl(phone))).withContext(phone).toBeNull();
      }
    });

    it('rejects other numbers', () => {
      for (const phone of ['0212345678', '091234567', '12345', 'abc']) {
        expect(vnPhone(new FormControl(phone))).withContext(phone).toEqual({ phone: true });
      }
    });
  });

  it('NAME_PATTERN accepts Vietnamese names and rejects digits', () => {
    expect(NAME_PATTERN.test('Nguyễn Văn Tiến')).toBeTrue();
    expect(NAME_PATTERN.test("O'Brien-Smith")).toBeTrue();
    expect(NAME_PATTERN.test('John 2')).toBeFalse();
    expect(NAME_PATTERN.test('A')).toBeFalse();
  });

  describe('couponValidator (async)', () => {
    const validator = couponValidator(new CouponService());

    it('is pending while checking, then valid for a real code', fakeAsync(() => {
      const control = new FormControl('welcome10', { asyncValidators: validator });
      expect(control.status).toBe('PENDING');
      tick(600); // the fake server delay
      expect(control.status).toBe('VALID');
    }));

    it('marks an unknown code invalid', fakeAsync(() => {
      const control = new FormControl('NOPE', { asyncValidators: validator });
      tick(600);
      expect(control.errors).toEqual({ invalidCoupon: true });
    }));

    it('treats an empty code as valid without calling the server', () => {
      const control = new FormControl('', { asyncValidators: validator });
      expect(control.status).toBe('VALID');
    });
  });
});
