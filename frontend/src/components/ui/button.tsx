import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-sans font-semibold tracking-[0.02em] transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-leather text-parchment shadow-paper hover:bg-leather-deep hover:shadow-lift",
        secondary:
          "bg-parchment text-ink border border-line-strong shadow-inset-paper hover:border-gold hover:text-ink",
        outline:
          "border border-line-strong bg-transparent text-ink-soft hover:bg-parchment hover:text-ink",
        ghost: "text-ink-soft hover:bg-paper-deep hover:text-ink",
        link: "text-binding underline-offset-4 hover:underline font-semibold",
        destructive:
          "bg-danger text-bone shadow-paper hover:brightness-110",
      },
      size: {
        default: "h-10 px-5 py-2 rounded-lg",
        sm: "h-8 gap-1.5 rounded-md px-3 text-sm",
        lg: "h-12 px-7 rounded-lg text-base",
        icon: "size-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };