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
        <label className="block mb-1 text-xs text-gray-400 uppercase tracking-wide">
          {label}
        </label>
      )}

    <button
      onClick={() => setOpen((prev) => !prev)}
      className="flex items-center justify-between w-48 px-4 py-2.5 rounded-xl
                bg-gradient-to-r from-gray-100 via-white to-gray-200
                text-gray-700 font-medium shadow-sm border border-gray-300
                hover:from-blue-50 hover:to-blue-100 hover:border-blue-400
                hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300
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
      className={`absolute right-0 mt-2 w-48 rounded-xl border border-gray-200
                  bg-white/80 backdrop-blur-md shadow-lg z-20
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
            ? "bg-blue-100 text-blue-700 font-semibold"
            : "hover:bg-blue-50 hover:text-blue-700 text-gray-700"
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
