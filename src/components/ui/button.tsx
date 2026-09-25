import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  // Boutique brutalist: display-face uppercase label, icon boxed in its own ink-bordered chip,
  // and a coloured sheet of paper stacked behind that the button presses down onto.
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border-2 border-foreground font-heading text-[13px] font-extrabold uppercase tracking-[0.08em] whitespace-nowrap outline-none select-none focus-visible:ring-3 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:border-2 [&_svg]:border-foreground [&_svg]:bg-brass [&_svg]:p-1 [&_svg]:text-foreground [&_svg:not([class*='size-'])]:size-6",
  {
    variants: {
      variant: {
        // Reason: the sheet colour is left to callers via under-* (defaults to brass) because
        // tailwind-merge can't dedupe custom utilities, so a variant default would fight overrides.
        default: "stack-sm stack-press bg-primary text-primary-foreground",
        outline:
          "stack-sm stack-press bg-card text-foreground hover:bg-muted aria-expanded:bg-muted",
        secondary:
          "stack-sm stack-press bg-secondary text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "border-transparent hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground [&_svg]:border-0 [&_svg]:bg-transparent [&_svg]:p-0 [&_svg:not([class*='size-'])]:size-4",
        destructive:
          "stack-sm stack-press bg-destructive text-white focus-visible:ring-destructive/40",
        link: "border-transparent text-primary underline-offset-4 hover:underline [&_svg]:border-0 [&_svg]:bg-transparent [&_svg]:p-0 [&_svg:not([class*='size-'])]:size-4",
      },
      size: {
        default: "h-9 gap-2 px-3 has-[>svg:first-child]:pl-1.5 has-[>svg:last-child]:pr-1.5",
        xs: "h-7 gap-1.5 px-2 text-[11px] has-[>svg:first-child]:pl-1 [&_svg:not([class*='size-'])]:size-5",
        sm: "h-8 gap-1.5 px-2.5 text-xs has-[>svg:first-child]:pl-1 [&_svg:not([class*='size-'])]:size-5",
        lg: "h-11 gap-2.5 px-4 text-sm has-[>svg:first-child]:pl-2 has-[>svg:last-child]:pr-2 [&_svg:not([class*='size-'])]:size-7",
        icon: "size-9 [&_svg]:border-0 [&_svg]:bg-transparent [&_svg]:p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-7 [&_svg]:border-0 [&_svg]:bg-transparent [&_svg]:p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 [&_svg]:border-0 [&_svg]:bg-transparent [&_svg]:p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-10 [&_svg]:border-0 [&_svg]:bg-transparent [&_svg]:p-0 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
