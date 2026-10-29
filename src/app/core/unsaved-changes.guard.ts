import { CanDeactivateFn } from '@angular/router';

export interface CanLeave {
  canLeave(): boolean;
}

/** Runs when the user navigates away from a route; returning false keeps them on the page. */
export const unsavedChangesGuard: CanDeactivateFn<CanLeave> = (component) => component.canLeave();
