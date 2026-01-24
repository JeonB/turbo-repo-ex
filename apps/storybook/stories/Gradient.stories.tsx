import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Gradient } from "@repo/ui/gradient";

const meta = {
  title: "UI/Gradient",
  component: Gradient,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    small: { control: "boolean" },
    conic: { control: "boolean" },
    className: { control: "text" },
  },
  args: {
    className: "ui:w-40 ui:h-40",
  },
  decorators: [
    (Story) => (
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Gradient>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    conic: true,
  },
};

export const Small: Story = {
  args: {
    small: true,
    conic: true,
  },
};

export const Conic: Story = {
  args: {
    conic: true,
  },
};

export const SmallConic: Story = {
  args: {
    small: true,
    conic: true,
  },
};
