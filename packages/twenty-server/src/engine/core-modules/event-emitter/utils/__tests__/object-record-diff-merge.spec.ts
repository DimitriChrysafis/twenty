import { objectRecordDiffMerge } from 'src/engine/core-modules/event-emitter/utils/object-record-diff-merge';

describe('objectRecordDiffMerge', () => {
  it('should keep the first before and the last after of a field changed twice', () => {
    expect(
      objectRecordDiffMerge(
        { diff: { jobTitle: { before: 'Engineer', after: 'Manager' } } },
        { diff: { jobTitle: { before: 'Manager', after: 'Director' } } },
      ),
    ).toEqual({
      diff: { jobTitle: { before: 'Engineer', after: 'Director' } },
    });
  });

  it('should keep fields changed by only one of the diffs', () => {
    expect(
      objectRecordDiffMerge(
        { diff: { jobTitle: { before: 'Engineer', after: 'Manager' } } },
        { diff: { city: { before: 'Paris', after: 'Madison' } } },
      ),
    ).toEqual({
      diff: {
        jobTitle: { before: 'Engineer', after: 'Manager' },
        city: { before: 'Paris', after: 'Madison' },
      },
    });
  });

  it('should drop a field reverted to its original value', () => {
    expect(
      objectRecordDiffMerge(
        {
          diff: {
            jobTitle: { before: 'Engineer', after: 'Manager' },
            city: { before: 'Paris', after: 'Madison' },
          },
        },
        { diff: { jobTitle: { before: 'Manager', after: 'Engineer' } } },
      ),
    ).toEqual({
      diff: { city: { before: 'Paris', after: 'Madison' } },
    });
  });

  it('should return an empty diff when every field is reverted', () => {
    expect(
      objectRecordDiffMerge(
        { diff: { jobTitle: { before: 'Engineer', after: 'Manager' } } },
        { diff: { jobTitle: { before: 'Manager', after: 'Engineer' } } },
      ),
    ).toEqual({ diff: {} });
  });

  it('should be idempotent when the same diff is merged twice', () => {
    expect(
      objectRecordDiffMerge(
        { diff: { jobTitle: { before: 'Engineer', after: 'Manager' } } },
        { diff: { jobTitle: { before: 'Engineer', after: 'Manager' } } },
      ),
    ).toEqual({
      diff: { jobTitle: { before: 'Engineer', after: 'Manager' } },
    });
  });

  it('should compare composite and relation values by content', () => {
    expect(
      objectRecordDiffMerge(
        {
          diff: {
            name: {
              before: { firstName: 'Ada', lastName: 'Lovelace' },
              after: { firstName: 'Ada', lastName: 'King' },
            },
            company: {
              before: { id: 'company-a' },
              after: { id: 'company-b' },
            },
          },
        },
        {
          diff: {
            name: {
              before: { firstName: 'Ada', lastName: 'King' },
              after: { firstName: 'Ada', lastName: 'Lovelace' },
            },
            company: {
              before: { id: 'company-b' },
              after: { id: 'company-a' },
            },
          },
        },
      ),
    ).toEqual({ diff: {} });
  });

  it('should return an empty diff when neither side has one', () => {
    expect(objectRecordDiffMerge({}, {})).toEqual({ diff: {} });
  });
});
