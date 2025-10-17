import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

const buttonStyles = cva(
    [
    "flex", "items-center", "w-full", "gap-4", "px-4", "py-3", 
    "rounded-2xl", "text-gray-400", "transition-all", 
    "duration-300", "ease-in-out", "font-medium"
    ],
    {
        variants: {
            variant: {
                ghost: ["hover:bg-gray-700/30"], //Para que cuando se pare el cursor, se sombree el boton
                default: [],
            },
            active: {
                true: "bg-[#757575]/70 text-white shadow-lg",
                false: "",
            },
            size: {
                default: ["rounded-2xl","p-2"],
                icon: [
                    "rounded-2xl",
                    "w-10 h-10", 
                    "flex", 
                    "items-center",
                    "justify-center",
                    "p-2.5",
                ],
            },
        },
        defaultVariants: {
            variant: "ghost",
            active: false,
            size: "default",
        }
    }
)

type ButtonProps = VariantProps<typeof buttonStyles> & 
ComponentProps<"button"> & {active?:boolean;}



export function Button({variant, size, active, className,...props}: ButtonProps) {
    return ( 
    <button {...props} 
    className={twMerge(buttonStyles({ variant, size, active}), className)}/>
    )
}