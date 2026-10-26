import { type TimelineActivityType } from '@/activities/timeline-activities/types/TimelineActivityType';
import { isDefined } from 'twenty-shared/utils';

export const getFieldUpdateTimelineActivityTypeUniversalIdentifiers = ({
  timelineActivityTypes,
  objectUniversalIdentifier,
}: {
  timelineActivityTypes: TimelineActivityType[];
  objectUniversalIdentifier: string;
}): string[] =>
  timelineActivityTypes
    .filter(
      (timelineActivityType) =>
        timelineActivityType.isActive === true &&
        timelineActivityType.action === 'updated' &&
        (!isDefined(timelineActivityType.objectUniversalIdentifier) ||
          timelineActivityType.objectUniversalIdentifier ===
            objectUniversalIdentifier),
    )
    .map(({ universalIdentifier }) => universalIdentifier);
