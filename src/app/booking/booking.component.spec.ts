import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DRAFT_KEY } from '../core/draft.service';
import { BookingComponent } from './booking.component';

describe('BookingComponent', () => {
  let fixture: ComponentFixture<BookingComponent>;
  let component: BookingComponent;

  function create(): void {
    fixture = TestBed.createComponent(BookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.removeItem(DRAFT_KEY);
    TestBed.configureTestingModule({ imports: [BookingComponent], providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.removeItem(DRAFT_KEY));

  it('creates one traveller form per guest, adults first', () => {
    create();
    const trip = component.form.controls.trip;
    expect(component.form.controls.travellers.length).toBe(2); // default: 2 adults

    trip.patchValue({ adults: 3, children: 1 });
    const types = component.form.controls.travellers.getRawValue().map((t) => t.type);
    expect(types).toEqual(['adult', 'adult', 'adult', 'child']);
  });

  it('keeps names already typed when the group size changes', () => {
    create();
    component.form.controls.travellers.at(0).controls.fullName.setValue('Nguyen Van An');
    component.form.controls.trip.patchValue({ adults: 4 });
    expect(component.form.controls.travellers.at(0).controls.fullName.value).toBe('Nguyen Van An');
  });

  it('does not move to the next step while the current one is invalid', () => {
    create();
    const continueButton = (): HTMLButtonElement =>
      Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find((b) =>
        b.textContent?.includes('Continue'),
      )!;

    continueButton().click(); // no tour, no date
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h2').textContent).toContain('Tour');
    expect(component.form.controls.trip.controls.tourId.touched).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('This field is required.');
  });

  it('restores a saved draft', () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        step: 0,
        savedAt: Date.now(),
        value: {
          trip: { tourId: 'sapa', departure: '', adults: 1, children: 2 },
          travellers: [
            { type: 'adult', fullName: 'Tran Thi Binh', dateOfBirth: '1990-01-01' },
            { type: 'child', fullName: '', dateOfBirth: '' },
            { type: 'child', fullName: '', dateOfBirth: '' },
          ],
          contact: { email: 'binh@example.com', phone: '' },
          extras: { room: 'deluxe', pickup: true, insurance: false, photographer: false, requests: '' },
          review: { coupon: '', terms: true },
        },
      }),
    );
    create();

    const v = component.form.getRawValue();
    expect(v.trip.tourId).toBe('sapa');
    expect(v.travellers.length).toBe(3);
    expect(v.travellers[0].fullName).toBe('Tran Thi Binh');
    expect(v.extras.room).toBe('deluxe');
    expect(v.review.terms).toBeFalse(); // must be accepted again
    expect(fixture.nativeElement.textContent).toContain('We restored your unfinished booking');
  });
});
