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
        className="flex items-center justify-between w-44 px-4 py-2 rounded-xl bg-gray-500/60 text-gray-000 
                   hover:bg-gray-500/60 focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        <span>{options.find((opt) => opt.value === value)?.label || "Seleccionar"}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      {open && (
        <ul className="absolute right-0 mt-2 w-44 bg-gray-800/90 backdrop-blur-md border border-gray-700/40 rounded-xl shadow-xl z-20">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={twMerge(
                "px-4 py-2 cursor-pointer transition-all",
                value === opt.value
                  ? "bg-gray-700/70 text-white"
                  : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
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
