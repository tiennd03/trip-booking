import { ADDONS, AddonKey, CHILD_RATE, Coupon, PriceBreakdown, PriceLine, ROOMS, RoomType, Tour } from './models';

export interface PriceInput {
  tour: Tour | null;
  adults: number;
  children: number;
  room: RoomType;
  addons: Record<AddonKey, boolean>;
  coupon: Coupon | null;
}

/** Two adults share a room; children stay with them. */
export function roomsNeeded(adults: number): number {
  return Math.max(1, Math.ceil(adults / 2));
}

/**
 * The full price, line by line. A pure function: same input → same output, no Angular, no side effects.
 * The UI just displays what this returns, and the unit tests can check every rule directly.
 */
export function calculatePrice(input: PriceInput): PriceBreakdown {
  const { tour, adults, children } = input;
  if (!tour || adults < 1) return { lines: [], subtotal: 0, discount: 0, total: 0 };

  const lines: PriceLine[] = [{ label: `Adults × ${adults}`, amount: adults * tour.pricePerAdult }];

  if (children > 0) {
    lines.push({ label: `Children × ${children} (70%)`, amount: Math.round(children * tour.pricePerAdult * CHILD_RATE) });
  }

  const room = ROOMS[input.room];
  if (room.perNight > 0 && tour.nights > 0) {
    const rooms = roomsNeeded(adults);
    lines.push({
      label: `${room.label} room upgrade (${rooms} room${rooms > 1 ? 's' : ''} × ${tour.nights} night${tour.nights > 1 ? 's' : ''})`,
      amount: room.perNight * rooms * tour.nights,
    });
  }

  for (const key of Object.keys(ADDONS) as AddonKey[]) {
    if (!input.addons[key]) continue;
    const addon = ADDONS[key];
    const people = adults + children;
    lines.push(
      addon.perPerson
        ? { label: `${addon.label} × ${people}`, amount: addon.price * people }
        : { label: addon.label, amount: addon.price },
    );
  }

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const discount = discountFor(input.coupon, subtotal);
  return { lines, subtotal, discount, total: subtotal - discount };
}

export function discountFor(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0;
  if (coupon.percent) return Math.round((subtotal * coupon.percent) / 100);
  if (coupon.amount) return Math.min(coupon.amount, subtotal); // never below zero
  return 0;
}
