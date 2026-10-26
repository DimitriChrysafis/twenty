import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { EventList } from '@/activities/timeline-activities/components/EventList';
import { timelineActivityTypeUniversalIdentifiersFilterFamilyState } from '@/activities/timeline-activities/states/timelineActivityTypeUniversalIdentifiersFilterFamilyState';
import { type TimelineActivity } from '@/activities/timeline-activities/types/TimelineActivity';
import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { type EventGroup } from '@/activities/timeline-activities/utils/groupEventsByMonth';

const PERSON_OBJECT_METADATA_ITEM = {
  id: 'person-object-id',
  universalIdentifier: 'person-object',
  nameSingular: 'person',
  fields: [{ name: 'jobTitle' }],
  readableFields: [{ name: 'jobTitle' }],
};

const OPPORTUNITY_OBJECT_METADATA_ITEM = {
  id: 'opportunity-object-id',
  universalIdentifier: 'opportunity-object',
  nameSingular: 'opportunity',
  fields: [{ name: 'stage' }],
  readableFields: [{ name: 'stage' }],
};

const RECORD_UPDATED: TimelineActivityType = {
  id: 'record-updated-id',
  universalIdentifier: 'record-updated',
  name: 'recordUpdated',
  label: 'updated',
  action: 'updated',
  icon: null,
  objectUniversalIdentifier: null,
  frontComponentUniversalIdentifier: null,
  isActive: true,
};

jest.mock(
  '@/activities/timeline-activities/hooks/useTimelineActivityTypes',
  () => ({
    useTimelineActivityTypes: () => ({
      activeTimelineActivityTypes: [RECORD_UPDATED],
      timelineActivityTypeMaps: {
        byId: new Map([[RECORD_UPDATED.id, RECORD_UPDATED]]),
        byUniversalIdentifier: new Map([
          [RECORD_UPDATED.universalIdentifier, RECORD_UPDATED],
        ]),
      },
    }),
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: PERSON_OBJECT_METADATA_ITEM,
  }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: [
      PERSON_OBJECT_METADATA_ITEM,
      OPPORTUNITY_OBJECT_METADATA_ITEM,
    ],
  }),
}));

jest.mock('@/activities/timeline-activities/components/EventsGroup', () => ({
  EventsGroup: ({ group }: { group: EventGroup }) => (
    <ul>
      {group.items.map((event) => (
        <li key={event.id}>{event.id}</li>
      ))}
    </ul>
  ),
}));

const createTimelineActivity = (
  timelineActivity: Pick<TimelineActivity, 'id' | 'properties'> &
    Partial<TimelineActivity>,
): TimelineActivity =>
  ({
    happensAt: '2026-10-01T10:00:00.000Z',
    timelineActivityTypeId: RECORD_UPDATED.id,
    timelineActivityTypeSnapshot: null,
    linkedRecordId: null,
    linkedObjectMetadataId: null,
    ...timelineActivity,
  }) as TimelineActivity;

const EVENTS = [
  createTimelineActivity({
    id: 'job title change',
    properties: {
      diff: { jobTitle: { before: 'Engineer', after: 'Manager' } },
    },
  }),
  createTimelineActivity({
    id: 'linked opportunity change',
    linkedRecordId: 'opportunity-id',
    linkedObjectMetadataId: OPPORTUNITY_OBJECT_METADATA_ITEM.id,
    properties: { diff: { stage: { before: 'NEW', after: 'MEETING' } } },
  }),
];

const renderEventList = (selectedUniversalIdentifiers: string[]) => {
  const store = createStore();

  store.set(
    timelineActivityTypeUniversalIdentifiersFilterFamilyState.atomFamily(
      'person-id',
    ),
    selectedUniversalIdentifiers,
  );

  render(
    <JotaiProvider store={store}>
      <I18nProvider i18n={i18n}>
        <EventList
          targetableObject={{
            id: 'person-id',
            targetObjectNameSingular: 'person',
          }}
          title="All"
          events={EVENTS}
        />
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('EventList', () => {
  it('shows linked record updates of the shared update type without a filter', () => {
    renderEventList([]);

    expect(screen.getByText('job title change')).toBeInTheDocument();
    expect(screen.getByText('linked opportunity change')).toBeInTheDocument();
  });

  it('hides linked record updates when only field changes are selected', () => {
    renderEventList([RECORD_UPDATED.universalIdentifier]);

    expect(screen.getByText('job title change')).toBeInTheDocument();
    expect(
      screen.queryByText('linked opportunity change'),
    ).not.toBeInTheDocument();
  });
});
