import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

const switchStyles = cva(
  [
    "relative", "inline-flex", "items-center", "cursor-pointer", 
    "transition-all", "duration-300", "ease-in-out", 
    "select-none"
  ],
  {
    variants: {
      size: {
        default: "w-12 h-7",
        sm: "w-10 h-5",
        lg: "w-14 h-8",
      },
      variant: {
        default: "",
        neumorphic: "shadow-inner bg-gray-200 dark:bg-gray-700 rounded-full p-[2px]",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

type SwitchProps = VariantProps<typeof switchStyles> &
  Omit<ComponentProps<"input">, 'onChange'> & {
    label?: string;
    checked?: boolean;
    onChange?: (value: boolean) => void;
  };

export function Switch({ label, checked = false, onChange, size, variant, className, ...props }: SwitchProps) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        className="sr-only peer"
        {...props}
      />


      <div
        className={twMerge(
          switchStyles({ size, variant }),
          `
            bg-gray-300 rounded-full transition-all duration-300 peer-focus:ring-4 
            peer-focus:ring-green-300 dark:peer-focus:ring-green-800 
            peer-checked:bg-gradient-to-r peer-checked:from-green-400 peer-checked:to-emerald-600 
            dark:bg-gray-600 dark:peer-checked:from-green-500 dark:peer-checked:to-green-700
          `,
          className
        )}
      >
        <div
          className={twMerge(
            "absolute top-[3px] left-[3px] bg-white rounded-full shadow-md transition-all duration-300 transform",
            size === "sm" ? "w-4 h-4 peer-checked:translate-x-4" :
            size === "lg" ? "w-7 h-7 peer-checked:translate-x-6" :
            "w-6 h-6 peer-checked:translate-x-5"
          )}
        />
      </div>

      {label && (
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-green-600 transition-colors duration-200">
          {label}
        </span>
      )}
    </label>
  );
}
