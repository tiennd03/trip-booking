import { TestBed } from '@angular/core/testing';
import { DRAFT_KEY, DraftService } from './draft.service';

describe('DraftService', () => {
  let drafts: DraftService;

  beforeEach(() => {
    localStorage.removeItem(DRAFT_KEY);
    drafts = TestBed.inject(DraftService);
  });

  afterEach(() => localStorage.removeItem(DRAFT_KEY));

  it('saves and loads a draft with its step', () => {
    drafts.save({ name: 'Anna' }, 2);
    const draft = drafts.load<{ name: string }>();
    expect(draft?.value.name).toBe('Anna');
    expect(draft?.step).toBe(2);
  });

  it('returns null when there is nothing saved or the data is corrupted', () => {
    expect(drafts.load()).toBeNull();
    localStorage.setItem(DRAFT_KEY, '{not json');
    expect(drafts.load()).toBeNull();
  });

  it('clears the draft', () => {
    drafts.save({}, 0);
    drafts.clear();
    expect(drafts.load()).toBeNull();
  });
});
