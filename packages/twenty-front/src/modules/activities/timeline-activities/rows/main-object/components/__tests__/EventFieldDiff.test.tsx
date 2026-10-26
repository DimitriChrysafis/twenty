import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';

import { EventFieldDiff } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiff';
import { EventFieldDiffContainer } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffContainer';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

const mockDiffValuesByStoreId = new Map<string, unknown>();

jest.mock(
  '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect',
  () => ({
    EventFieldDiffValueEffect: ({
      diffArtificialRecordStoreId,
      diffRecord,
    }: {
      diffArtificialRecordStoreId: string;
      diffRecord: unknown;
    }) => {
      mockDiffValuesByStoreId.set(diffArtificialRecordStoreId, diffRecord);

      return null;
    },
  }),
);

jest.mock(
  '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue',
  () => ({
    EventFieldDiffValue: ({
      diffArtificialRecordStoreId,
    }: {
      diffArtificialRecordStoreId: string;
    }) => (
      <span>
        {String(mockDiffValuesByStoreId.get(diffArtificialRecordStoreId))}
      </span>
    ),
  }),
);

jest.mock(
  '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel',
  () => ({
    EventFieldDiffLabel: ({
      fieldMetadataItem,
    }: {
      fieldMetadataItem: { label: string };
    }) => <span>{fieldMetadataItem.label}</span>,
  }),
);

jest.mock(
  '@/activities/timeline-activities/rows/main-object/components/EventRelationFieldDiffValues',
  () => ({
    EventRelationFieldDiffValues: () => (
      <span>
        <span>Tim A</span>
        <span>→</span>
        <span>Tim Apple</span>
      </span>
    ),
  }),
);

const jobTitleFieldMetadataItem = {
  id: 'field-job-title',
  name: 'jobTitle',
  label: 'Job Title',
  type: FieldMetadataType.TEXT,
} as FieldMetadataItem;

const mainObjectMetadataItem = {
  nameSingular: 'person',
  fields: [jobTitleFieldMetadataItem],
} as EnrichedObjectMetadataItem;

const renderWithI18n = (node: ReactNode) =>
  render(<I18nProvider i18n={i18n}>{node}</I18nProvider>);

const renderEventFieldDiff = (fieldDiff: { before: unknown; after: unknown }) =>
  renderWithI18n(
    <EventFieldDiff
      fieldDiff={fieldDiff}
      mainObjectMetadataItem={mainObjectMetadataItem}
      fieldMetadataItem={jobTitleFieldMetadataItem}
      beforeDiffArtificialRecordStoreId="event-id--field-job-title--before"
      afterDiffArtificialRecordStoreId="event-id--field-job-title--after"
    />,
  );

describe('EventFieldDiff', () => {
  afterEach(() => {
    mockDiffValuesByStoreId.clear();
  });

  it('renders the previous and the new value', () => {
    const { container } = renderEventFieldDiff({
      before: 'Engineer',
      after: 'Manager',
    });

    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(container).toHaveTextContent('Job TitleEngineer→Manager');
  });

  it('renders "Empty" on the previous side when the field was set', () => {
    const { container } = renderEventFieldDiff({
      before: '',
      after: 'Manager',
    });

    expect(container).toHaveTextContent('Job TitleEmpty→Manager');
    expect(screen.queryByText('Engineer')).not.toBeInTheDocument();
  });

  it('renders "Empty" on the new side when the field was cleared', () => {
    const { container } = renderEventFieldDiff({
      before: 'Engineer',
      after: null,
    });

    expect(container).toHaveTextContent('Job TitleEngineer→Empty');
    expect(screen.queryByText('Manager')).not.toBeInTheDocument();
  });

  it('renders "Empty" on both sides for composite values whose subfields are empty', () => {
    renderEventFieldDiff({
      before: { primaryLinkUrl: '', primaryLinkLabel: null },
      after: { primaryLinkUrl: '', primaryLinkLabel: '' },
    });

    expect(screen.getAllByText('Empty')).toHaveLength(2);
  });

  it('renders a relation change with a single arrow between both sides', () => {
    const { container } = renderWithI18n(
      <EventFieldDiff
        fieldDiff={{ before: { id: 'before-id' }, after: { id: 'after-id' } }}
        mainObjectMetadataItem={mainObjectMetadataItem}
        fieldMetadataItem={
          {
            id: 'field-account-owner',
            name: 'accountOwner',
            label: 'Account Owner',
            type: FieldMetadataType.RELATION,
          } as FieldMetadataItem
        }
        beforeDiffArtificialRecordStoreId="event-id--field-account-owner--before"
        afterDiffArtificialRecordStoreId="event-id--field-account-owner--after"
      />,
    );

    expect(container).toHaveTextContent('Account OwnerTim A→Tim Apple');
    expect(screen.getAllByText('→')).toHaveLength(1);
  });
});

describe('EventFieldDiffContainer', () => {
  afterEach(() => {
    mockDiffValuesByStoreId.clear();
  });

  it('renders each side from its own record store id', () => {
    renderWithI18n(
      <EventFieldDiffContainer
        mainObjectMetadataItem={mainObjectMetadataItem}
        diffKey="jobTitle"
        fieldDiff={{ before: 'Engineer', after: 'Manager' }}
        eventId="event-id"
      />,
    );

    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders nothing when the field diff is missing', () => {
    const { container } = renderWithI18n(
      <EventFieldDiffContainer
        mainObjectMetadataItem={mainObjectMetadataItem}
        diffKey="jobTitle"
        fieldDiff={undefined}
        eventId="event-id"
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
