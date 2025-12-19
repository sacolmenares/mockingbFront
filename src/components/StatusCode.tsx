import { ChevronDown } from 'lucide-react';
import { useState } from 'react';


interface StatusCodeProps {
  label: string;
  value: number; 
  onChange: (value: number) => void; 
  options?: { value: number; label: string }[];
}

// Opciones del dropdown por defecto
const defaultResponseOptions = [
  { value: 200, label: '200 OK' },
  { value: 401, label: '401 Not Authorized' },
  { value: 404, label: '404 Not Found' },
  { value: 500, label: '500 Internal Server Error' },
  

];


export function StatusCode({ label, value, onChange, options = defaultResponseOptions }: StatusCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  
  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onMouseDown={() => setIsOpen(true)}
          onChange={(e) => { onChange(Number(e.target.value)); setIsOpen(false); }}
          onBlur={() => setIsOpen(false)}
          className="w-full bg-gray-300/60 dark:bg-gray-700/60 p-3 rounded-2xl text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border-transparent appearance-none pr-10"
        >

          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown 
            size={16} 
            className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>
    </div>
  );
}
