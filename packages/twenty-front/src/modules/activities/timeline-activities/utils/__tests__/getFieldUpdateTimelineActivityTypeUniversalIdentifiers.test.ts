import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { getFieldUpdateTimelineActivityTypeUniversalIdentifiers } from '@/activities/timeline-activities/utils/getFieldUpdateTimelineActivityTypeUniversalIdentifiers';

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-0000000person';
const NOTE_OBJECT_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-00000000note';

const createTimelineActivityType = (
  timelineActivityType: Pick<
    TimelineActivityType,
    'universalIdentifier' | 'action' | 'objectUniversalIdentifier'
  > &
    Partial<TimelineActivityType>,
): TimelineActivityType => ({
  id: `${timelineActivityType.universalIdentifier}-id`,
  name: timelineActivityType.universalIdentifier,
  label: timelineActivityType.universalIdentifier,
  icon: null,
  frontComponentUniversalIdentifier: null,
  isActive: true,
  ...timelineActivityType,
});

const getIdentifiers = (timelineActivityTypes: TimelineActivityType[]) =>
  getFieldUpdateTimelineActivityTypeUniversalIdentifiers({
    timelineActivityTypes,
    objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
  });

describe('getFieldUpdateTimelineActivityTypeUniversalIdentifiers', () => {
  it('includes the shared updated type', () => {
    expect(
      getIdentifiers([
        createTimelineActivityType({
          universalIdentifier: 'record-updated',
          action: 'updated',
          objectUniversalIdentifier: null,
        }),
      ]),
    ).toEqual(['record-updated']);
  });

  it('includes an updated type bound to the current object', () => {
    expect(
      getIdentifiers([
        createTimelineActivityType({
          universalIdentifier: 'person-updated',
          action: 'updated',
          objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    ).toEqual(['person-updated']);
  });

  it('excludes updated types bound to another object', () => {
    expect(
      getIdentifiers([
        createTimelineActivityType({
          universalIdentifier: 'note-updated',
          action: 'updated',
          objectUniversalIdentifier: NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    ).toEqual([]);
  });

  it('excludes inactive types', () => {
    expect(
      getIdentifiers([
        createTimelineActivityType({
          universalIdentifier: 'record-updated',
          action: 'updated',
          objectUniversalIdentifier: null,
          isActive: false,
        }),
        createTimelineActivityType({
          universalIdentifier: 'person-updated',
          action: 'updated',
          objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
          isActive: undefined,
        }),
      ]),
    ).toEqual([]);
  });

  it('excludes types that are not updates', () => {
    expect(
      getIdentifiers([
        createTimelineActivityType({
          universalIdentifier: 'record-created',
          action: 'created',
          objectUniversalIdentifier: null,
        }),
        createTimelineActivityType({
          universalIdentifier: 'record-linked',
          action: 'linked',
          objectUniversalIdentifier: null,
        }),
        createTimelineActivityType({
          universalIdentifier: 'custom-type',
          action: null,
          objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    ).toEqual([]);
  });

  it('keeps only the field update types of a mixed list, in order', () => {
    expect(
      getIdentifiers([
        createTimelineActivityType({
          universalIdentifier: 'record-created',
          action: 'created',
          objectUniversalIdentifier: null,
        }),
        createTimelineActivityType({
          universalIdentifier: 'record-updated',
          action: 'updated',
          objectUniversalIdentifier: null,
        }),
        createTimelineActivityType({
          universalIdentifier: 'note-updated',
          action: 'updated',
          objectUniversalIdentifier: NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
        createTimelineActivityType({
          universalIdentifier: 'person-updated',
          action: 'updated',
          objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    ).toEqual(['record-updated', 'person-updated']);
  });
});
