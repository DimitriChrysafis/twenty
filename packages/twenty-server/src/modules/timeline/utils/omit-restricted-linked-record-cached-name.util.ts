import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const canReadLinkedRecordCachedName = ({
  linkedObjectMetadataId,
  objectsPermissions,
  flatObjectMetadataMaps,
}: {
  linkedObjectMetadataId: unknown;
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
}): boolean => {
  if (!isNonEmptyString(linkedObjectMetadataId)) {
    return false;
  }

  const linkedFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: linkedObjectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(linkedFlatObjectMetadata)) {
    return false;
  }

  const objectPermissions = objectsPermissions[linkedFlatObjectMetadata.id];

  if (objectPermissions?.canReadObjectRecords === false) {
    return false;
  }

  const { labelIdentifierFieldMetadataId } = linkedFlatObjectMetadata;

  return (
    !isDefined(labelIdentifierFieldMetadataId) ||
    objectPermissions?.restrictedFields?.[labelIdentifierFieldMetadataId]
      ?.canRead !== false
  );
};

export const omitRestrictedLinkedRecordCachedName = ({
  timelineActivity,
  objectsPermissions,
  flatObjectMetadataMaps,
}: {
  timelineActivity: Record<string, unknown>;
  objectsPermissions: ObjectsPermissions;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): unknown => {
  const { linkedRecordCachedName } = timelineActivity;

  if (!isNonEmptyString(linkedRecordCachedName)) {
    return linkedRecordCachedName;
  }

  return canReadLinkedRecordCachedName({
    linkedObjectMetadataId: timelineActivity.linkedObjectMetadataId,
    objectsPermissions,
    flatObjectMetadataMaps,
  })
    ? linkedRecordCachedName
    : null;
};
