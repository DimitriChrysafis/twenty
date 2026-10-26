import { EventRowMainObjectUpdated } from '@/activities/timeline-activities/rows/main-object/components/EventRowMainObjectUpdated';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from 'twenty-ui/testing';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const meta: Meta<typeof EventRowMainObjectUpdated> = {
  title: 'Modules/TimelineActivities/Rows/MainObject/EventRowMainObjectUpdated',
  component: EventRowMainObjectUpdated,
  args: {
    authorFullName: 'John Doe',
    labelIdentifierValue: 'Mock',
    event: {
      id: '1',
      properties: {
        diff: {
          jobTitle: {
            after: 'Engineering Manager',
            before: 'Software Engineer',
          },
          linkedinLink: {
            after: {
              url: 'linkedin.com/in/jane-doe',
              label: 'Jane Doe',
            },
            before: {
              url: 'linkedin.com/in/jdoe-old',
              label: 'J. Doe',
            },
          },
        },
      },
    },
    mainObjectMetadataItem: getTestEnrichedObjectMetadataItemsMock().find(
      (item) => item.nameSingular === 'person',
    ),
  },
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof EventRowMainObjectUpdated>;

export const Default: Story = {};

export const SingleFieldCleared: Story = {
  args: {
    event: {
      id: '2',
      properties: {
        diff: {
          jobTitle: {
            after: '',
            before: 'Software Engineer',
          },
        },
      },
    },
  },
};
