import { isEmptyTimelineDiffValue } from '@/activities/timeline-activities/utils/isEmptyTimelineDiffValue';

describe('isEmptyTimelineDiffValue', () => {
  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an empty string', ''],
    [
      'a composite value whose subfields are all empty',
      { primaryLinkUrl: '', primaryLinkLabel: null, secondaryLinks: undefined },
    ],
    ['an empty array', []],
    [
      'an emails value with no primary email and no additional emails',
      { primaryEmail: '', additionalEmails: [] },
    ],
  ])('treats %s as empty', (_description, value) => {
    expect(isEmptyTimelineDiffValue(value)).toBe(true);
  });

  it.each([
    ['a non-empty string', 'Engineer'],
    ['zero', 0],
    ['false', false],
    [
      'a composite value with one filled subfield',
      { primaryLinkUrl: 'linkedin.com/in/jane', primaryLinkLabel: '' },
    ],
    [
      'a composite value with a zero amount',
      { amountMicros: 0, currencyCode: '' },
    ],
    ['a non-empty array', ['OPTION_A']],
    [
      'an emails value with only additional emails',
      { primaryEmail: '', additionalEmails: ['ada@example.com'] },
    ],
  ])('does not treat %s as empty', (_description, value) => {
    expect(isEmptyTimelineDiffValue(value)).toBe(false);
  });
});
