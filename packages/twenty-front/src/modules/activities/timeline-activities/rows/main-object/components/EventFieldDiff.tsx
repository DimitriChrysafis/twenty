import { styled } from '@linaria/react';

import { EventFieldDiffLabel } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffLabel';
import { EventFieldDiffValue } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValue';
import { EventFieldDiffValueEffect } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffValueEffect';
import { EventRelationFieldDiffValues } from '@/activities/timeline-activities/rows/main-object/components/EventRelationFieldDiffValues';
import { isEmptyTimelineDiffValue } from '@/activities/timeline-activities/utils/isEmptyTimelineDiffValue';
import { isRelationFieldChangeValue } from '@/activities/timeline-activities/utils/relationFieldChangeValue';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { Trans } from '@lingui/react/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';
import { doNotTranslate } from 'twenty-shared/i18n';

type EventFieldDiffProps = {
  fieldDiff: { before: unknown; after: unknown };
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem | undefined;
  beforeDiffArtificialRecordStoreId: string;
  afterDiffArtificialRecordStoreId: string;
};

type EventFieldDiffSideProps = {
  value: unknown;
  diffArtificialRecordStoreId: string;
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
};

const StyledEventFieldDiffContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEventFieldDiffSide = styled.div`
  display: flex;
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
`;

const StyledEmptyValue = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledArrowContainer = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  flex-shrink: 0;
`;

const EventFieldDiffSide = ({
  value,
  diffArtificialRecordStoreId,
  mainObjectMetadataItem,
  fieldMetadataItem,
}: EventFieldDiffSideProps) => (
  <StyledEventFieldDiffSide>
    {isEmptyTimelineDiffValue(value) ? (
      <StyledEmptyValue>
        <Trans>Empty</Trans>
      </StyledEmptyValue>
    ) : (
      <>
        <EventFieldDiffValueEffect
          diffArtificialRecordStoreId={diffArtificialRecordStoreId}
          mainObjectMetadataItem={mainObjectMetadataItem}
          fieldMetadataItem={fieldMetadataItem}
          diffRecord={value as Record<string, unknown> | undefined}
        />
        <EventFieldDiffValue
          diffArtificialRecordStoreId={diffArtificialRecordStoreId}
          mainObjectMetadataItem={mainObjectMetadataItem}
          fieldMetadataItem={fieldMetadataItem}
        />
      </>
    )}
  </StyledEventFieldDiffSide>
);

export const EventFieldDiff = ({
  fieldDiff,
  mainObjectMetadataItem,
  fieldMetadataItem,
  beforeDiffArtificialRecordStoreId,
  afterDiffArtificialRecordStoreId,
}: EventFieldDiffProps) => {
  if (!fieldMetadataItem) {
    throw new Error(doNotTranslate('fieldMetadataItem is required'));
  }

  const isRelationFieldDiff =
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    (isRelationFieldChangeValue(fieldDiff.before) ||
      isRelationFieldChangeValue(fieldDiff.after));

  if (isRelationFieldDiff) {
    return (
      <StyledEventFieldDiffContainer>
        <EventFieldDiffLabel fieldMetadataItem={fieldMetadataItem} />
        <EventRelationFieldDiffValues
          fieldDiff={fieldDiff}
          fieldMetadataItem={fieldMetadataItem}
        />
      </StyledEventFieldDiffContainer>
    );
  }

  return (
    <StyledEventFieldDiffContainer>
      <EventFieldDiffLabel fieldMetadataItem={fieldMetadataItem} />
      <EventFieldDiffSide
        value={fieldDiff.before}
        diffArtificialRecordStoreId={beforeDiffArtificialRecordStoreId}
        mainObjectMetadataItem={mainObjectMetadataItem}
        fieldMetadataItem={fieldMetadataItem}
      />
      <StyledArrowContainer>→</StyledArrowContainer>
      <EventFieldDiffSide
        value={fieldDiff.after}
        diffArtificialRecordStoreId={afterDiffArtificialRecordStoreId}
        mainObjectMetadataItem={mainObjectMetadataItem}
        fieldMetadataItem={fieldMetadataItem}
      />
    </StyledEventFieldDiffContainer>
  );
};
