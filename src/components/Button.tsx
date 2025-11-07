import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"


const buttonStyles = cva(
  [
    "flex", "items-center", "justify-center", "gap-4",
    "px-4", "py-3", "rounded-2xl", "transition-all",
    "duration-300", "ease-in-out", "font-medium", "select-none",
  ],
  {
    variants: {
      variant: {
        ghost: ["text-gray-400 hover:bg-gray-700/30"],
        default: ["text-gray-700 bg-gray-100 hover:bg-gray-200"],
        gradient: [], 
      },
      active: {
        true: "shadow-lg scale-[1.02]",
        false: "",
      },
      size: {
        default: ["text-sm", "px-5", "py-2.5"],
        icon: [
          "rounded-2xl",
          "w-10",
          "h-10",
          "p-2.5",
          "flex",
          "items-center",
          "justify-center",
        ],
      },
    },
    defaultVariants: {
      variant: "ghost",
      active: false,
      size: "default",
    },
  }
)


type ButtonProps = VariantProps<typeof buttonStyles> &
  ComponentProps<"button"> & {
    active?: boolean
    gradientColors?: string
  }


export function Button({
  variant,
  size,
  active,
  className,
  gradientColors,
  ...props
}: ButtonProps) {
  const gradientClass = gradientColors
    ? `text-white bg-gradient-to-r ${gradientColors} hover:bg-gradient-to-br 
       focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 shadow-md`
    : ""

  return (
    <button
      {...props}
      className={twMerge(
        buttonStyles({ variant, size, active }),
        gradientClass,
        className
      )}
    />
  )
}
