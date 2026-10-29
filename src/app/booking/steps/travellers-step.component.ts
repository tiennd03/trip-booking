import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { toISODate } from '../../core/dates';
import { FieldErrorComponent } from '../../shared/field-error.component';
import { BookingForm } from '../booking-form';

@Component({
  selector: 'app-travellers-step',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  template: `
    @let f = form();
    <div [formGroup]="f" class="space-y-8">
      <section>
        <h3 class="step-label">Travellers</h3>
        <p class="mb-4 text-sm text-slate-500">Names exactly as on ID or passport. Ages are checked on the departure date.</p>

        <!-- formArrayName + [formGroupName]="i": each traveller is a FormGroup inside the FormArray -->
        <div formArrayName="travellers" class="space-y-4">
          @for (traveller of f.controls.travellers.controls; track traveller; let i = $index) {
            <fieldset [formGroupName]="i" class="rounded-2xl border border-slate-200 bg-white p-4">
              <legend class="px-1 text-sm font-semibold">{{ titleFor(i) }}</legend>
              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                  <span class="field-label">Full name</span>
                  <input formControlName="fullName" autocomplete="name" class="field" />
                  <app-field-error [control]="traveller.controls.fullName" />
                </label>
                <label class="block">
                  <span class="field-label">Date of birth</span>
                  <input type="date" formControlName="dateOfBirth" [max]="today" class="field" />
                  <app-field-error [control]="traveller.controls.dateOfBirth" />
                </label>
              </div>
            </fieldset>
          }
        </div>
      </section>

      <section formGroupName="contact">
        <h3 class="step-label">Contact details</h3>
        <p class="mb-4 text-sm text-slate-500">We send the confirmation here.</p>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="field-label">Email</span>
            <input type="email" formControlName="email" autocomplete="email" class="field" />
            <app-field-error [control]="f.controls.contact.controls.email" />
          </label>
          <label class="block">
            <span class="field-label">Mobile phone</span>
            <input type="tel" formControlName="phone" autocomplete="tel" placeholder="0912 345 678" class="field" />
            <app-field-error [control]="f.controls.contact.controls.phone" />
          </label>
        </div>
      </section>
    </div>
  `,
})
export class TravellersStepComponent {
  readonly form = input.required<BookingForm>();
  protected readonly today = toISODate(new Date());

  /** "Adult 1", "Adult 2", "Child 1"… — numbering restarts for children. */
  protected titleFor(index: number): string {
    const travellers = this.form().controls.travellers.controls;
    const type = travellers[index].controls.type.value;
    const number = travellers.slice(0, index + 1).filter((t) => t.controls.type.value === type).length;
    return `${type === 'adult' ? 'Adult' : 'Child'} ${number}${index === 0 ? ' · lead traveller' : ''}`;
  }
}
