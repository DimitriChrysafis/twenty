import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const isFieldUpdateTimelineActivityTypeFilter = ({
  selectedUniversalIdentifiers,
  fieldUpdateUniversalIdentifiers,
}: {
  selectedUniversalIdentifiers: string[] | null;
  fieldUpdateUniversalIdentifiers: string[];
}): boolean => {
  if (
    !isDefined(selectedUniversalIdentifiers) ||
    !isNonEmptyArray(fieldUpdateUniversalIdentifiers)
  ) {
    return false;
  }

  const selectedUniversalIdentifierSet = new Set(selectedUniversalIdentifiers);
  const fieldUpdateUniversalIdentifierSet = new Set(
    fieldUpdateUniversalIdentifiers,
  );

  return (
    selectedUniversalIdentifierSet.size ===
      fieldUpdateUniversalIdentifierSet.size &&
    [...fieldUpdateUniversalIdentifierSet].every((universalIdentifier) =>
      selectedUniversalIdentifierSet.has(universalIdentifier),
    )
  );
};
