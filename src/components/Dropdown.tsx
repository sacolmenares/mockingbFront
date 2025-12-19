import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface Option {
  label: string;
  value: string;
}

interface DropdownProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Dropdown({ label, options, value, onChange, className }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={twMerge("relative inline-block text-left", className)}>
      {label && (
        <label className="block mb-1 text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
          {label}
        </label>
      )}

    <button
      onClick={() => setOpen((prev) => !prev)}
      className="flex items-center justify-between w-48 px-4 py-2.5 rounded-xl
                bg-gradient-to-r from-gray-100 via-white to-gray-200
                dark:from-gray-700 dark:via-gray-800 dark:to-gray-700
                text-gray-700 dark:text-gray-200 font-medium shadow-sm border border-gray-300 dark:border-gray-600
                hover:from-blue-50 hover:to-blue-100 hover:border-blue-400
                dark:hover:from-gray-600 dark:hover:to-gray-600
                hover:text-blue-700 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600
                transition-all duration-300"
    >
      <span>{options.find((opt) => opt.value === value)?.label || "Seleccionar"}</span>
      <ChevronDown
        size={18}
        className={`transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
      />
    </button>

    {open && (
        <ul
      className={`absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 dark:border-gray-600
                  bg-white/80 dark:bg-gray-800/95 backdrop-blur-md shadow-lg z-20
                  ${open ? 'animate-fade-in-down' : 'animate-fade-out-up'}`}
      >
    {options.map((opt) => (
      <li
        key={opt.value}
        onClick={() => {
          onChange(opt.value);
          setOpen(false);
        }}
        className={twMerge(
          "px-4 py-2 cursor-pointer transition-all duration-200 rounded-lg",
          value === opt.value
            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
            : "hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-700 dark:hover:text-blue-300 text-gray-700 dark:text-gray-200"
        )}
      >
        {opt.label}
      </li>
    ))}
  </ul>
)}

    </div>
  );
}
