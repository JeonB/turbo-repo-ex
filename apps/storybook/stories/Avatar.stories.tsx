import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "@repo/ui/avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
    src: { control: "text" },
    alt: { control: "text" },
    fallback: { control: "text" },
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    fallback: "JD",
    size: "md",
  },
};

export const WithImage: Story = {
  args: {
    src: "https://github.com/vercel.png",
    alt: "Vercel",
    size: "md",
  },
};

export const Small: Story = {
  args: {
    fallback: "S",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    fallback: "AB",
    size: "lg",
  },
};

export const NoFallback: Story = {
  args: {
    size: "md",
  },
};
