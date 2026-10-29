import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-b border-teal-900/10 bg-white/70 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <a routerLink="/" class="flex items-center gap-2 text-lg font-bold text-teal-800">
          <img src="favicon.svg" alt="" width="28" height="28" />
          Wanderly
        </a>
        <nav class="ml-auto flex items-center gap-4 text-sm font-medium">
          <a routerLink="/how-it-works" class="text-teal-800 hover:underline">How it works</a>
          <span class="hidden rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800 sm:inline">Demo · no real bookings</span>
        </nav>
      </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <router-outlet />
    </main>
  `,
})
export class App {}
