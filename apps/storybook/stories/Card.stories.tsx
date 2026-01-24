import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '@repo/ui/card';

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    href: { control: 'text' },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Documentation',
    children: 'Find in-depth information about this project and its usage.',
    href: 'https://turbo.build/repo/docs',
  },
};

export const LearnMore: Story = {
  args: {
    title: 'Learn More',
    children: 'Learn about Next.js, React, and monorepo best practices.',
    href: 'https://nextjs.org/learn',
  },
};
