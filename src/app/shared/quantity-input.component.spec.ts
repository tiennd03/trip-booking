import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { QuantityInputComponent } from './quantity-input.component';

// Testing a ControlValueAccessor the way it's really used: inside a host with a FormControl
@Component({
  imports: [ReactiveFormsModule, QuantityInputComponent],
  template: `<app-quantity-input [formControl]="control" [min]="1" [max]="3" label="adults" />`,
})
class HostComponent {
  control = new FormControl(2, { nonNullable: true });
}

describe('QuantityInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let buttons: HTMLButtonElement[];

  const output = () => fixture.nativeElement.querySelector('output').textContent.trim();

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    buttons = Array.from(fixture.nativeElement.querySelectorAll('button'));
  });

  it('shows the form value (form → component)', () => {
    expect(output()).toBe('2');
    host.control.setValue(3);
    fixture.detectChanges();
    expect(output()).toBe('3');
  });

  it('updates the form when clicked (component → form) and marks it touched', () => {
    buttons[1].click(); // +
    expect(host.control.value).toBe(3);
    expect(host.control.touched).toBeTrue();
  });

  it('stays within min and max and disables the buttons at the limits', () => {
    buttons[1].click();
    buttons[1].click(); // would be 4, max is 3
    fixture.detectChanges();
    expect(host.control.value).toBe(3);
    expect(buttons[1].disabled).toBeTrue();

    host.control.setValue(1);
    fixture.detectChanges();
    expect(buttons[0].disabled).toBeTrue();
  });

  it('is disabled when the form control is disabled', () => {
    host.control.disable();
    fixture.detectChanges();
    expect(buttons.every((b) => b.disabled)).toBeTrue();
  });
});
