import { Component, input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

/** Turns a control's first error into a readable message. Shared by every step. */
export function errorMessage(errors: ValidationErrors | null): string | null {
  if (!errors) return null;
  if (errors['required']) return 'This field is required.';
  if (errors['email']) return 'Enter a valid email address.';
  if (errors['phone']) return 'Enter a Vietnamese mobile number, e.g. 0912 345 678.';
  if (errors['pattern']) return 'Use letters only (2–60 characters).';
  if (errors['minDate']) return `Departures must be on or after ${errors['minDate'].min}.`;
  if (errors['date']) return 'Enter a valid date.';
  if (errors['min']) return `The minimum is ${errors['min'].min}.`;
  if (errors['max']) return `The maximum is ${errors['max'].max}.`;
  if (errors['maxlength']) return `Keep it under ${errors['maxlength'].requiredLength} characters.`;
  if (errors['futureDate']) return "Date of birth can't be in the future.";
  if (errors['adultAge']) return 'Adults must be at least 18 on the departure date.';
  if (errors['childAge']) return 'Children must be 2–17 years old on the departure date.';
  if (errors['invalidCoupon']) return 'This code is not valid.';
  return 'Please check this field.';
}

/**
 * Shows the error under a field once the user has touched it.
 * Uses the default change detection on purpose: a control's touched/errors state is not a signal,
 * so OnPush wouldn't notice when it changes.
 */
@Component({
  selector: 'app-field-error',
  template: `
    @if (control().touched && control().invalid) {
      <p class="mt-1 text-sm text-rose-600" role="alert">{{ message() }}</p>
    }
  `,
})
export class FieldErrorComponent {
  readonly control = input.required<AbstractControl>();

  protected message(): string | null {
    return errorMessage(this.control().errors);
  }
}
