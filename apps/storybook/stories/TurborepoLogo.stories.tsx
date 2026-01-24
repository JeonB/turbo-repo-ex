import type { Meta, StoryObj } from '@storybook/react-vite';
import { TurborepoLogo } from '@repo/ui/turborepo-logo';

const meta = {
  title: 'UI/TurborepoLogo',
  component: TurborepoLogo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TurborepoLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
