import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "@repo/ui/button";

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "primary", "danger"],
    },
    disabled: { control: "boolean" },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Primary: Story = {
  args: {
    children: "Primary",
    variant: "primary",
  },
};

export const Danger: Story = {
  args: {
    children: "Danger",
    variant: "danger",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled",
    variant: "default",
    disabled: true,
  },
};
