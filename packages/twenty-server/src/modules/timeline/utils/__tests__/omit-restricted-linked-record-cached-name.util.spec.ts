import {
  FieldMetadataType,
  type ObjectPermissions,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { omitRestrictedLinkedRecordCachedName } from 'src/modules/timeline/utils/omit-restricted-linked-record-cached-name.util';

const NOTE_TITLE_FIELD_ID = 'note-title-field-id';

const NOTE_OBJECT = getFlatObjectMetadataMock({
  id: 'note-object-id',
  universalIdentifier: 'note-object-id',
  nameSingular: 'note',
  fieldIds: [NOTE_TITLE_FIELD_ID],
  labelIdentifierFieldMetadataId: NOTE_TITLE_FIELD_ID,
});

const UNLABELED_OBJECT = {
  ...getFlatObjectMetadataMock({
    id: 'unlabeled-object-id',
    universalIdentifier: 'unlabeled-object-id',
    nameSingular: 'unlabeled',
  }),
  labelIdentifierFieldMetadataId: null,
};

const flatObjectMetadataMaps = [NOTE_OBJECT, UNLABELED_OBJECT].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatFieldMetadataMock({
    id: NOTE_TITLE_FIELD_ID,
    universalIdentifier: NOTE_TITLE_FIELD_ID,
    objectMetadataId: NOTE_OBJECT.id,
    type: FieldMetadataType.TEXT,
    name: 'title',
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const buildObjectPermissions = (
  overrides: Partial<ObjectPermissions>,
): ObjectPermissions => ({
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
  ...overrides,
});

const READABLE_NOTE: ObjectsPermissions = {
  [NOTE_OBJECT.id]: buildObjectPermissions({}),
};

const LINKED_NOTE_NAME = 'Quarterly board notes';

const omitCachedName = ({
  timelineActivity,
  objectsPermissions = READABLE_NOTE,
}: {
  timelineActivity: Record<string, unknown>;
  objectsPermissions?: ObjectsPermissions;
}) =>
  omitRestrictedLinkedRecordCachedName({
    timelineActivity,
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('omitRestrictedLinkedRecordCachedName', () => {
  it('should keep the name when the role can read the linked object and its label identifier field', () => {
    expect(
      omitCachedName({
        timelineActivity: {
          linkedObjectMetadataId: NOTE_OBJECT.id,
          linkedRecordCachedName: LINKED_NOTE_NAME,
        },
      }),
    ).toBe(LINKED_NOTE_NAME);
  });

  it('should keep the name when the role has no permission entry for the linked object', () => {
    expect(
      omitCachedName({
        timelineActivity: {
          linkedObjectMetadataId: NOTE_OBJECT.id,
          linkedRecordCachedName: LINKED_NOTE_NAME,
        },
        objectsPermissions: {},
      }),
    ).toBe(LINKED_NOTE_NAME);
  });

  it('should return null when the role cannot read the linked object records', () => {
    expect(
      omitCachedName({
        timelineActivity: {
          linkedObjectMetadataId: NOTE_OBJECT.id,
          linkedRecordCachedName: LINKED_NOTE_NAME,
        },
        objectsPermissions: {
          [NOTE_OBJECT.id]: buildObjectPermissions({
            canReadObjectRecords: false,
          }),
        },
      }),
    ).toBeNull();
  });

  it('should return null when the label identifier field is restricted', () => {
    expect(
      omitCachedName({
        timelineActivity: {
          linkedObjectMetadataId: NOTE_OBJECT.id,
          linkedRecordCachedName: LINKED_NOTE_NAME,
        },
        objectsPermissions: {
          [NOTE_OBJECT.id]: buildObjectPermissions({
            restrictedFields: {
              [NOTE_TITLE_FIELD_ID]: { canRead: false, canUpdate: false },
            },
          }),
        },
      }),
    ).toBeNull();
  });

  it.each([
    { description: 'missing', timelineActivity: {} },
    { description: 'null', timelineActivity: { linkedObjectMetadataId: null } },
    { description: 'empty', timelineActivity: { linkedObjectMetadataId: '' } },
    {
      description: 'unknown',
      timelineActivity: { linkedObjectMetadataId: 'unknown-object-id' },
    },
  ])(
    'should return null when the linked object id is $description',
    ({ timelineActivity }) => {
      expect(
        omitCachedName({
          timelineActivity: {
            ...timelineActivity,
            linkedRecordCachedName: LINKED_NOTE_NAME,
          },
        }),
      ).toBeNull();
    },
  );

  it.each([
    { description: 'an empty name', linkedRecordCachedName: '' },
    { description: 'a null name', linkedRecordCachedName: null },
    { description: 'an undefined name', linkedRecordCachedName: undefined },
  ])('should return $description unchanged', ({ linkedRecordCachedName }) => {
    expect(
      omitCachedName({
        timelineActivity: {
          linkedObjectMetadataId: NOTE_OBJECT.id,
          linkedRecordCachedName,
        },
        objectsPermissions: {
          [NOTE_OBJECT.id]: buildObjectPermissions({
            canReadObjectRecords: false,
          }),
        },
      }),
    ).toBe(linkedRecordCachedName);
  });

  it('should keep the name when the readable linked object has no label identifier field', () => {
    expect(
      omitCachedName({
        timelineActivity: {
          linkedObjectMetadataId: UNLABELED_OBJECT.id,
          linkedRecordCachedName: LINKED_NOTE_NAME,
        },
        objectsPermissions: {
          [UNLABELED_OBJECT.id]: buildObjectPermissions({
            restrictedFields: {
              [NOTE_TITLE_FIELD_ID]: { canRead: false, canUpdate: false },
            },
          }),
        },
      }),
    ).toBe(LINKED_NOTE_NAME);
  });
});
