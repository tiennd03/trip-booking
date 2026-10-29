import { createBookingCode } from './booking-api.service';

describe('createBookingCode', () => {
  it('has the WND- prefix and 6 easy-to-read characters', () => {
    const code = createBookingCode();
    expect(code).toMatch(/^WND-[A-HJ-NP-Z2-9]{6}$/);
  });

  it('is deterministic for a given random source', () => {
    expect(createBookingCode(() => 0)).toBe('WND-AAAAAA');
  });
});
