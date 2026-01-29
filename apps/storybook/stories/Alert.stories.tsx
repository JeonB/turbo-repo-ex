import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "@repo/ui/alert";

const meta = {
  title: "UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "error"],
    },
    title: { control: "text" },
    children: { control: "text" },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This is an informational alert.",
    variant: "info",
  },
};

export const Info: Story = {
  args: {
    title: "Info",
    children: "You can use this for general information.",
    variant: "info",
  },
};

export const Success: Story = {
  args: {
    title: "Success",
    children: "Your changes have been saved.",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    title: "Warning",
    children: "Please review before continuing.",
    variant: "warning",
  },
};

export const Error: Story = {
  args: {
    title: "Error",
    children: "Something went wrong. Please try again.",
    variant: "error",
  },
};
