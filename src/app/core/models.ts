export interface Tour {
  id: string;
  name: string;
  location: string;
  emoji: string;
  days: number;
  nights: number;
  pricePerAdult: number; // VND
  summary: string;
}

export type TravellerType = 'adult' | 'child';
export type RoomType = 'standard' | 'deluxe' | 'suite';

export interface Coupon {
  code: string;
  label: string;
  percent?: number; // e.g. 10 = 10% off
  amount?: number; // fixed VND off
}

export interface PriceLine {
  label: string;
  amount: number;
}

export interface PriceBreakdown {
  lines: PriceLine[];
  subtotal: number;
  discount: number;
  total: number;
}

// ---------- Static catalogue (would come from an API in a real app) ----------

export const TOURS: Tour[] = [
  { id: 'halong', name: 'Ha Long Bay Cruise', location: 'Quang Ninh', emoji: '🛳️', days: 2, nights: 1, pricePerAdult: 2_900_000, summary: 'Overnight cruise, kayaking and cave visits.' },
  { id: 'sapa', name: 'Sa Pa Trekking', location: 'Lao Cai', emoji: '⛰️', days: 3, nights: 2, pricePerAdult: 3_500_000, summary: 'Rice terraces, village homestay and local guides.' },
  { id: 'hoian', name: 'Hoi An & Da Nang', location: 'Central Vietnam', emoji: '🏮', days: 4, nights: 3, pricePerAdult: 5_200_000, summary: 'Ancient town, beaches and the Golden Bridge.' },
  { id: 'mekong', name: 'Mekong Delta', location: 'Can Tho', emoji: '🛶', days: 2, nights: 1, pricePerAdult: 1_800_000, summary: 'Floating markets, orchards and river life.' },
];

export const ROOMS: Record<RoomType, { label: string; perNight: number; description: string }> = {
  standard: { label: 'Standard', perNight: 0, description: 'Included in the tour price' },
  deluxe: { label: 'Deluxe', perNight: 400_000, description: 'Larger room with a view' },
  suite: { label: 'Suite', perNight: 1_200_000, description: 'Separate living area, best view' },
};

export const ROOM_TYPES = Object.keys(ROOMS) as RoomType[];

export const ADDONS = {
  pickup: { label: 'Airport pickup', price: 350_000, perPerson: false },
  insurance: { label: 'Travel insurance', price: 120_000, perPerson: true },
  photographer: { label: 'Private photographer (half day)', price: 900_000, perPerson: false },
} as const;
export type AddonKey = keyof typeof ADDONS;
export const ADDON_KEYS = Object.keys(ADDONS) as AddonKey[];

/** Children pay 70% of the adult price. */
export const CHILD_RATE = 0.7;
export const MAX_GUESTS = 10;
export const MIN_DAYS_AHEAD = 3;

export function findTour(id: string | null | undefined): Tour | null {
  return TOURS.find((t) => t.id === id) ?? null;
}
