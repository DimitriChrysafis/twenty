import { gql } from 'graphql-tag';
import request from 'supertest';
import { createCustomRoleWithObjectPermissions } from 'test/integration/graphql/utils/create-custom-role-with-object-permissions.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { findOneRoleByLabel } from 'test/integration/metadata/suites/role/utils/find-one-role-by-label.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeRestApiRequest } from 'test/integration/rest/utils/make-rest-api-request.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const PERSON_ID = '20202020-7272-4000-8000-000000000001';
const INITIAL_NAME = { firstName: 'Ada', lastName: 'ReadPath' };
const NAME_SET_BY_JANE = { firstName: 'Ada', lastName: 'Lovelace' };
const NAME_SET_BY_JONY = { firstName: 'Ada', lastName: 'Byron' };

const FIND_MANY_TIMELINE_ACTIVITY_TYPES = gql`
  query FindManyTimelineActivityTypes {
    timelineActivityTypes {
      id
      action
      objectUniversalIdentifier
    }
  }
`;

type TimelineActivityType = {
  id: string;
  action: string | null;
  objectUniversalIdentifier: string | null;
};

type TimelineActivityRow = {
  id: string;
  happensAt: string;
  workspaceMemberId: string | null;
  properties: Record<string, unknown> | null;
};

type TimelineActivityConnection = {
  edges: { node: TimelineActivityRow; cursor: string }[];
  pageInfo: { hasNextPage: boolean; endCursor: string };
};

const updatePersonName = async ({
  name,
  token,
}: {
  name: object;
  token: string;
}): Promise<void> => {
  const response = await makeGraphqlApiRequest(
    updateOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: 'id',
      recordId: PERSON_ID,
      data: { name },
    }),
    token,
  );

  expect(response.body.errors).toBeUndefined();

  await waitForAllJobsToFinish();
};

describe('timeline activity history read (integration)', () => {
  let updatedTimelineActivityTypeId: string;
  let originalMemberRoleId: string;
  let customRoleId: string | undefined;

  const buildPersonHistoryOperation = ({
    first,
    after,
  }: {
    first?: number;
    after?: string;
  } = {}) =>
    findManyOperationFactory({
      objectMetadataSingularName: 'timelineActivity',
      objectMetadataPluralName: 'timelineActivities',
      gqlFields: 'id happensAt workspaceMemberId properties',
      filter: {
        targetPersonId: { eq: PERSON_ID },
        timelineActivityTypeId: { eq: updatedTimelineActivityTypeId },
      },
      orderBy: [{ happensAt: 'DescNullsFirst' }],
      first,
      after,
    });

  const findPersonHistory = async (
    pagination: { first?: number; after?: string } = {},
  ): Promise<TimelineActivityConnection> => {
    const response = await makeGraphqlApiRequest(
      buildPersonHistoryOperation(pagination),
    );

    expect(response.body.errors).toBeUndefined();

    return response.body.data.timelineActivities;
  };

  const findPersonHistoryIds = async (): Promise<string[]> =>
    (await findPersonHistory()).edges.map(({ node }) => node.id);

  beforeAll(async () => {
    const timelineActivityTypesResponse = await makeMetadataApiRequest({
      query: FIND_MANY_TIMELINE_ACTIVITY_TYPES,
    });

    expect(timelineActivityTypesResponse.body.errors).toBeUndefined();

    const updatedTimelineActivityTypes: TimelineActivityType[] =
      timelineActivityTypesResponse.body.data.timelineActivityTypes.filter(
        ({ action }: TimelineActivityType) => action === 'updated',
      );
    const updatedTimelineActivityType =
      updatedTimelineActivityTypes.find(
        ({ objectUniversalIdentifier }) =>
          objectUniversalIdentifier ===
          STANDARD_OBJECTS.person.universalIdentifier,
      ) ??
      updatedTimelineActivityTypes.find(
        ({ objectUniversalIdentifier }) =>
          !isDefined(objectUniversalIdentifier),
      );

    if (!isDefined(updatedTimelineActivityType)) {
      throw new Error('No timeline activity type seeded for action updated');
    }

    updatedTimelineActivityTypeId = updatedTimelineActivityType.id;
    originalMemberRoleId = (await findOneRoleByLabel({ label: 'Member' })).id;

    const createResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        data: { id: PERSON_ID, name: INITIAL_NAME },
      }),
    );

    expect(createResponse.body.errors).toBeUndefined();

    await waitForAllJobsToFinish();

    await updatePersonName({
      name: NAME_SET_BY_JANE,
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    await updatePersonName({
      name: NAME_SET_BY_JONY,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });
  });

  afterAll(async () => {
    if (isDefined(customRoleId)) {
      await updateWorkspaceMemberRole({
        client,
        roleId: originalMemberRoleId,
        workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      });

      await deleteRole(client, customRoleId);
    }

    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: PERSON_ID,
      }),
    );
  });

  it('returns one entry per author, newest first, with field, previous value, new value and time', async () => {
    const timelineActivities = (await findPersonHistory()).edges.map(
      ({ node }) => node,
    );

    expect(
      timelineActivities.map(({ workspaceMemberId }) => workspaceMemberId),
    ).toEqual([
      WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
    ]);
    expect(new Date(timelineActivities[0].happensAt).getTime()).toBeGreaterThan(
      new Date(timelineActivities[1].happensAt).getTime(),
    );
    expect(timelineActivities[0].properties).toMatchObject({
      diff: { name: { before: NAME_SET_BY_JANE, after: NAME_SET_BY_JONY } },
    });
    expect(timelineActivities[1].properties).toMatchObject({
      diff: { name: { before: INITIAL_NAME, after: NAME_SET_BY_JANE } },
    });
  });

  it('returns the same entries over REST', async () => {
    const graphqlTimelineActivityIds = await findPersonHistoryIds();

    const response = await makeRestApiRequest({
      method: 'get',
      path: `/timelineActivities?filter=targetPersonId[eq]:${PERSON_ID},timelineActivityTypeId[eq]:${updatedTimelineActivityTypeId}&order_by=happensAt[DescNullsFirst]`,
      bearer: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(response.status).toBe(200);
    expect(
      response.body.data.timelineActivities.map(({ id }: { id: string }) => id),
    ).toEqual(graphqlTimelineActivityIds);
  });

  it('paginates with cursors', async () => {
    const timelineActivityIds = await findPersonHistoryIds();

    const firstPage = await findPersonHistory({ first: 1 });

    expect(firstPage.edges).toHaveLength(1);
    expect(firstPage.pageInfo.hasNextPage).toBe(true);

    const secondPage = await findPersonHistory({
      first: 1,
      after: firstPage.pageInfo.endCursor,
    });

    expect(secondPage.edges).toHaveLength(1);
    expect([firstPage.edges[0].node.id, secondPage.edges[0].node.id]).toEqual(
      timelineActivityIds,
    );
  });

  it('returns no history to a role that cannot read people', async () => {
    const { roleId } = await createCustomRoleWithObjectPermissions({
      label: 'TimelineHistoryPersonUnreadableRole',
      canReadPerson: false,
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    const response = await makeGraphqlApiRequestWithMemberRole(
      buildPersonHistoryOperation(),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.timelineActivities.edges).toEqual([]);
  });
});
