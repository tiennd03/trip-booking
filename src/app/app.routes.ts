import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './core/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Book a tour · Wanderly',
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./booking/booking.component').then((m) => m.BookingComponent),
  },
  {
    path: 'confirmation/:code',
    title: 'Booking confirmed · Wanderly',
    loadComponent: () => import('./confirmation/confirmation.component').then((m) => m.ConfirmationComponent),
  },
  {
    path: 'how-it-works',
    title: 'How it works · Wanderly',
    loadComponent: () => import('./info/how-it-works.component').then((m) => m.HowItWorksComponent),
  },
  { path: '**', redirectTo: '' },
];
