import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * A "− 2 +" number picker that works with formControlName, exactly like a native <input>.
 *
 * ControlValueAccessor is the bridge between Angular forms and a custom component:
 *  - writeValue        form → component (initial value, setValue, reset)
 *  - registerOnChange  gives us a function to call when the user changes the value (component → form)
 *  - registerOnTouched gives us a function to call when the user has interacted (marks it "touched")
 *  - setDisabledState  form → component when the control is disabled/enabled
 */
@Component({
  selector: 'app-quantity-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    // Registers this component as the value accessor for any form directive placed on it
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => QuantityInputComponent), multi: true },
  ],
  template: `
    <div class="inline-flex items-center rounded-xl border border-slate-300 bg-white" role="group" [attr.aria-label]="label()">
      <button
        type="button"
        class="grid size-10 place-items-center rounded-l-xl text-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        (click)="step(-1)"
        [disabled]="disabled() || value() <= min()"
        [attr.aria-label]="'Decrease ' + label()"
      >
        −
      </button>
      <output class="w-10 text-center font-semibold tabular-nums" aria-live="polite">{{ value() }}</output>
      <button
        type="button"
        class="grid size-10 place-items-center rounded-r-xl text-lg hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
        (click)="step(1)"
        [disabled]="disabled() || value() >= max()"
        [attr.aria-label]="'Increase ' + label()"
      >
        +
      </button>
    </div>
  `,
})
export class QuantityInputComponent implements ControlValueAccessor {
  readonly min = input(0);
  readonly max = input(10);
  readonly label = input('quantity');

  protected readonly value = signal(0);
  protected readonly disabled = signal(false);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: number | null): void {
    this.value.set(Number(value ?? 0));
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected step(delta: number): void {
    const next = Math.min(this.max(), Math.max(this.min(), this.value() + delta));
    this.onTouched();
    if (next === this.value()) return;
    this.value.set(next);
    this.onChange(next);
  }
}
