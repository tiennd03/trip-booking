import { addDays, ageOn, parseISODate, toISODate } from './dates';

describe('dates', () => {
  it('converts between Date and yyyy-MM-dd in local time', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(parseISODate('2026-01-05')?.getDate()).toBe(5);
  });

  it('rejects malformed dates', () => {
    expect(parseISODate('05/01/2026')).toBeNull();
    expect(parseISODate('')).toBeNull();
  });

  it('adds days across a month end', () => {
    expect(toISODate(addDays(new Date(2026, 0, 30), 3))).toBe('2026-02-02');
  });

  it('counts age only once the birthday has passed', () => {
    const birth = new Date(2008, 5, 15); // 15 June 2008
    expect(ageOn(birth, new Date(2026, 5, 14))).toBe(17);
    expect(ageOn(birth, new Date(2026, 5, 15))).toBe(18);
  });
});
