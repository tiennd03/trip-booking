import { TOURS } from './models';
import { PriceInput, calculatePrice, discountFor, roomsNeeded } from './pricing';

const halong = TOURS.find((t) => t.id === 'halong')!; // 2,900,000 / adult, 1 night
const base: PriceInput = {
  tour: halong,
  adults: 2,
  children: 0,
  room: 'standard',
  addons: { pickup: false, insurance: false, photographer: false },
  coupon: null,
};

describe('calculatePrice', () => {
  it('returns zero when no tour is selected', () => {
    expect(calculatePrice({ ...base, tour: null }).total).toBe(0);
  });

  it('charges adults the full price', () => {
    const price = calculatePrice(base);
    expect(price.lines).toEqual([{ label: 'Adults × 2', amount: 5_800_000 }]);
    expect(price.total).toBe(5_800_000);
  });

  it('charges children 70%', () => {
    const price = calculatePrice({ ...base, children: 1 });
    expect(price.lines[1].amount).toBe(2_030_000);
    expect(price.total).toBe(7_830_000);
  });

  it('adds the room upgrade per room per night', () => {
    // 3 adults → 2 rooms × 1 night × 400,000
    const price = calculatePrice({ ...base, adults: 3, room: 'deluxe' });
    expect(price.lines.at(-1)!.amount).toBe(800_000);
  });

  it('charges insurance per person and pickup once', () => {
    const price = calculatePrice({ ...base, children: 1, addons: { pickup: true, insurance: true, photographer: false } });
    const amounts = price.lines.map((l) => l.amount);
    expect(amounts).toContain(350_000); // pickup, flat
    expect(amounts).toContain(360_000); // insurance 120,000 × 3 people
  });

  it('applies a percentage coupon to the subtotal', () => {
    const price = calculatePrice({ ...base, coupon: { code: 'WELCOME10', label: '', percent: 10 } });
    expect(price.discount).toBe(580_000);
    expect(price.total).toBe(5_220_000);
  });
});

describe('discountFor', () => {
  it('never discounts more than the subtotal', () => {
    expect(discountFor({ code: 'X', label: '', amount: 500 }, 300)).toBe(300);
  });

  it('is zero without a coupon', () => {
    expect(discountFor(null, 1000)).toBe(0);
  });
});

describe('roomsNeeded', () => {
  it('puts two adults per room, at least one room', () => {
    expect(roomsNeeded(1)).toBe(1);
    expect(roomsNeeded(2)).toBe(1);
    expect(roomsNeeded(3)).toBe(2);
    expect(roomsNeeded(0)).toBe(1);
  });
});
