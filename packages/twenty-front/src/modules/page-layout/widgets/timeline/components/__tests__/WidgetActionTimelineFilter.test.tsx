import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { WidgetActionTimelineFilter } from '@/page-layout/widgets/timeline/components/WidgetActionTimelineFilter';

jest.mock(
  '@/activities/timeline-activities/hooks/useTimelineActivityTypes',
  () => ({
    useTimelineActivityTypes: jest.fn(),
  }),
);

jest.mock('@/ui/layout/contexts/useTargetRecord', () => ({
  useTargetRecord: () => ({
    id: 'person-id',
    targetObjectNameSingular: 'person',
  }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: {
      nameSingular: 'person',
      universalIdentifier: 'person-object',
    },
  }),
}));

const { useTimelineActivityTypes } = jest.requireMock(
  '@/activities/timeline-activities/hooks/useTimelineActivityTypes',
);

const createTimelineActivityType = (
  timelineActivityType: Pick<
    TimelineActivityType,
    'universalIdentifier' | 'label' | 'action' | 'objectUniversalIdentifier'
  >,
): TimelineActivityType => ({
  id: `${timelineActivityType.universalIdentifier}-id`,
  name: timelineActivityType.universalIdentifier,
  icon: null,
  frontComponentUniversalIdentifier: null,
  isActive: true,
  ...timelineActivityType,
});

const RECORD_CREATED = createTimelineActivityType({
  universalIdentifier: 'record-created',
  label: 'was created by',
  action: 'created',
  objectUniversalIdentifier: null,
});

const RECORD_UPDATED = createTimelineActivityType({
  universalIdentifier: 'record-updated',
  label: 'updated',
  action: 'updated',
  objectUniversalIdentifier: null,
});

const PERSON_UPDATED = createTimelineActivityType({
  universalIdentifier: 'person-updated',
  label: 'updated the person',
  action: 'updated',
  objectUniversalIdentifier: 'person-object',
});

const NOTE_UPDATED = createTimelineActivityType({
  universalIdentifier: 'note-updated',
  label: 'updated a related note',
  action: 'updated',
  objectUniversalIdentifier: 'note-object',
});

const mockActiveTimelineActivityTypes = (
  activeTimelineActivityTypes: TimelineActivityType[],
) =>
  useTimelineActivityTypes.mockReturnValue({
    activeTimelineActivityTypes,
    timelineActivityTypeMaps: {
      byId: new Map(),
      byUniversalIdentifier: new Map(),
    },
  });

const openTimelineFilter = async () => {
  const user = userEvent.setup();

  render(
    <JotaiProvider store={createStore()}>
      <I18nProvider i18n={i18n}>
        <WidgetActionTimelineFilter />
      </I18nProvider>
    </JotaiProvider>,
  );

  await user.click(screen.getByRole('button', { name: 'Filter timeline' }));

  return {
    user,
    picker: await screen.findByRole('dialog', { name: 'Filter timeline' }),
  };
};

describe('WidgetActionTimelineFilter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('selects only the field update types of the record object', async () => {
    mockActiveTimelineActivityTypes([
      RECORD_CREATED,
      RECORD_UPDATED,
      PERSON_UPDATED,
      NOTE_UPDATED,
    ]);

    const { user, picker } = await openTimelineFilter();

    await user.click(
      within(picker).getByRole('button', { name: 'Show field changes only' }),
    );

    expect(
      within(picker).getByRole('button', { name: 'updated' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(picker).getByRole('button', { name: 'updated the person' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      within(picker).getByRole('button', { name: 'updated a related note' }),
    ).not.toHaveAttribute('aria-pressed', 'true');
    expect(
      within(picker).getByRole('button', { name: 'was created by' }),
    ).not.toHaveAttribute('aria-pressed', 'true');
    expect(
      within(picker).getByRole('button', { name: 'Clear filter' }),
    ).toBeInTheDocument();
  });

  it('hides the action when no type tracks field updates of the record object', async () => {
    mockActiveTimelineActivityTypes([RECORD_CREATED, NOTE_UPDATED]);

    const { picker } = await openTimelineFilter();

    expect(
      within(picker).queryByRole('button', {
        name: 'Show field changes only',
      }),
    ).not.toBeInTheDocument();
  });
});
