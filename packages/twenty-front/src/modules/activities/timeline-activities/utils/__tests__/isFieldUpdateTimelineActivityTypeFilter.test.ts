import { isFieldUpdateTimelineActivityTypeFilter } from '@/activities/timeline-activities/utils/isFieldUpdateTimelineActivityTypeFilter';

describe('isFieldUpdateTimelineActivityTypeFilter', () => {
  it('is true when exactly the field update types are selected, in any order', () => {
    expect(
      isFieldUpdateTimelineActivityTypeFilter({
        selectedUniversalIdentifiers: ['person-updated', 'record-updated'],
        fieldUpdateUniversalIdentifiers: ['record-updated', 'person-updated'],
      }),
    ).toBe(true);
  });

  it('is false when no filter is selected', () => {
    expect(
      isFieldUpdateTimelineActivityTypeFilter({
        selectedUniversalIdentifiers: null,
        fieldUpdateUniversalIdentifiers: ['record-updated'],
      }),
    ).toBe(false);
  });

  it('is false when other types are selected too', () => {
    expect(
      isFieldUpdateTimelineActivityTypeFilter({
        selectedUniversalIdentifiers: ['record-updated', 'note-updated'],
        fieldUpdateUniversalIdentifiers: ['record-updated'],
      }),
    ).toBe(false);
  });

  it('is false when only part of the field update types are selected', () => {
    expect(
      isFieldUpdateTimelineActivityTypeFilter({
        selectedUniversalIdentifiers: ['record-updated'],
        fieldUpdateUniversalIdentifiers: ['record-updated', 'person-updated'],
      }),
    ).toBe(false);
  });

  it('is false when there is no field update type', () => {
    expect(
      isFieldUpdateTimelineActivityTypeFilter({
        selectedUniversalIdentifiers: [],
        fieldUpdateUniversalIdentifiers: [],
      }),
    ).toBe(false);
  });
});
