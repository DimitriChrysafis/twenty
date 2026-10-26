import { isObject } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

const isEmptyScalarTimelineDiffValue = (value: unknown): boolean =>
  !isDefined(value) ||
  value === '' ||
  (Array.isArray(value) && !isNonEmptyArray(value));

export const isEmptyTimelineDiffValue = (value: unknown): boolean =>
  isEmptyScalarTimelineDiffValue(value) ||
  (isObject(value) &&
    Object.values(value).every(isEmptyScalarTimelineDiffValue));
