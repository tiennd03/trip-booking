import { Injectable } from '@angular/core';

export const DRAFT_KEY = 'trip-booking.draft.v1';

export interface Draft<T> {
  value: T;
  step: number;
  savedAt: number;
}

/** Saves the unfinished booking in localStorage so a reload or closed tab doesn't lose it. */
@Injectable({ providedIn: 'root' })
export class DraftService {
  save<T>(value: T, step: number): void {
    const draft: Draft<T> = { value, step, savedAt: Date.now() };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // storage full or blocked
    }
  }

  load<T>(): Draft<T> | null {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
      const draft = JSON.parse(raw) as Draft<T>;
      return typeof draft === 'object' && draft !== null && 'value' in draft && typeof draft.step === 'number' ? draft : null;
    } catch {
      return null;
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // ignore
    }
  }
}
