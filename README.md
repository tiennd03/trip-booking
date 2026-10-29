# Trip Booking (Wanderly)

A four-step tour booking flow for a fictional travel agency: choose a tour and date, enter traveller details, pick a room and extras, then review and confirm — with a live price summary the whole way.

Built to show what Angular **reactive forms** can do: nested typed groups, a dynamic `FormArray`, custom sync and async validators, a custom form control (`ControlValueAccessor`), autosaved drafts and an unsaved-changes guard.

> **Live demo:** _add your deployed URL here_ · Demo only — no real bookings or payments.

## Features

- **4-step wizard** — progress bar, jump back to any visited step, "Edit" links from the review page, Enter key moves forward.
- **Validation per step** — you can't continue until the current step is valid; errors appear under each field and focus moves to the first one.
- **Dynamic traveller forms** — one form per guest, rebuilt when the number of adults/children changes, keeping what was already typed.
- **Business rules** — departure at least 3 days ahead, max 10 guests, adults 18+ and children 2–17 *on the departure date*, Vietnamese phone numbers, Unicode names.
- **Coupon codes** — checked against a (simulated) server on blur, with a "Checking…" state. Try `WELCOME10` or `SAVE200K`.
- **Live pricing** — adults, children at 70%, room upgrades per room per night, per-person and flat add-ons, discounts.
- **Autosaved draft** — progress is saved to localStorage; reloading restores it (with a "Start over" option).
- **Unsaved-changes guard** — asks before leaving the page mid-booking.
- **Confirmation page** — booking code and summary. Use an email ending in `@fail.test` to see the error handling.

## Tech highlights

| Area | What's used |
| --- | --- |
| Forms | One typed `FormGroup` with nested groups per step, `FormArray<FormGroup>`, `NonNullableFormBuilder`, `updateOn: 'blur'` |
| Validators | Factory validators (`minDaysFromToday`, `ageOnDeparture`), a group validator (`maxGuests`), an async validator (`couponValidator`) |
| Custom control | `QuantityInputComponent` implements `ControlValueAccessor` and works with `formControlName` |
| State | Signals derived from form events (`toSignal(merge(valueChanges, statusChanges))`), `computed` price |
| Logic | Pricing and date maths are pure functions with unit tests |
| Routing | Lazy routes, functional `CanDeactivate` guard, route param → component input |
| RxJS | `debounceTime` autosave, `merge`, `firstValueFrom` to await a pending async validator |
| Testing | 39 Jasmine tests: pricing, dates, every validator (sync and async with `fakeAsync`), the CVA inside a host form, the booking component |

## Project structure

```
src/app
├── core/
│   ├── models.ts                 # Tours, rooms, add-ons, types
│   ├── pricing.ts                # calculatePrice() — pure
│   ├── dates.ts                  # local-date helpers, ageOn()
│   ├── validators.ts             # custom sync/async validators
│   ├── coupon.service.ts         # simulated coupon API
│   ├── booking-api.service.ts    # simulated booking API
│   ├── draft.service.ts          # localStorage draft
│   └── unsaved-changes.guard.ts
├── shared/
│   ├── quantity-input.component.ts  # ControlValueAccessor
│   └── field-error.component.ts     # error messages
├── booking/
│   ├── booking-form.ts           # form factory + types
│   ├── booking.component.*       # wizard, navigation, autosave, submit
│   └── steps/                    # trip, travellers, extras, review
└── confirmation/
```

## Getting started

```bash
npm install
npm start
npm test
```

## License

MIT
