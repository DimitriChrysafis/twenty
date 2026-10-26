import { EventFieldDiff } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiff';
import { findFieldMetadataItemByDiffKey } from '@/activities/timeline-activities/utils/findFieldMetadataItemByDiffKey';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { ErrorBoundary } from 'react-error-boundary';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type EventFieldDiffContainerProps = {
  mainObjectMetadataItem: EnrichedObjectMetadataItem;
  diffKey: string;
  fieldDiff: { before: unknown; after: unknown } | null | undefined;
  eventId: string;
};

export const EventFieldDiffContainer = ({
  mainObjectMetadataItem,
  diffKey,
  fieldDiff,
  eventId,
}: EventFieldDiffContainerProps) => {
  if (!isDefined(fieldDiff)) {
    return null;
  }

  const fieldMetadataItem = findFieldMetadataItemByDiffKey(
    mainObjectMetadataItem.fields,
    diffKey,
  );

  if (!isDefined(fieldMetadataItem)) {
    throw new Error(
      doNotTranslate(
        `Cannot find field metadata item for field name ${diffKey} on object ${mainObjectMetadataItem.nameSingular}`,
      ),
    );
  }

  const diffArtificialRecordStoreId = `${eventId}--${fieldMetadataItem.id}`;

  return (
    <ErrorBoundary
      resetKeys={[diffArtificialRecordStoreId]}
      fallbackRender={() => null}
    >
      <EventFieldDiff
        key={diffArtificialRecordStoreId}
        fieldDiff={fieldDiff}
        fieldMetadataItem={fieldMetadataItem}
        mainObjectMetadataItem={mainObjectMetadataItem}
        beforeDiffArtificialRecordStoreId={`${diffArtificialRecordStoreId}--before`}
        afterDiffArtificialRecordStoreId={`${diffArtificialRecordStoreId}--after`}
      />
    </ErrorBoundary>
  );
};
