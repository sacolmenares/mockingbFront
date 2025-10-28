import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';


const methodStyles: { [key: string]: string } = {
  GET: 'bg-green-200 text-green-900',
  POST: 'bg-yellow-200 text-yellow-900',
  PUT: 'bg-blue-300 text-blue-900',
  DELETE: 'bg-red-200 text-red-900',
};


interface EndpointInputProps {
  method: string;
  path: string;
  onMethodChange: (method: string) => void; //funcion cuando se eliga el metodo
  onPathChange: (path: string) => void; //funcion cuando se coloque el endpoint
}

export function EndpointInput({ method, path, onMethodChange, onPathChange }: EndpointInputProps) {
  // Para saber si el dropdown está abierto o cerrado.
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); 


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-600 mb-2"></label>
      <div className="flex items-center">
        <div className="relative" ref={dropdownRef}>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-3 rounded-l-lg font-bold text-xs transition-colors z-10 ${methodStyles[method]}`}
          >
            {method}
            <ChevronDown size={16} 
            className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full mt-2 w-32 bg-white rounded-lg shadow-xl z-20">
              {Object.keys(methodStyles).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    onMethodChange(m); 
                    setIsOpen(false);   
                  }}
                  className={`w-full text-left px-4 py-2 font-bold text-xs hover:bg-gray-100 ${methodStyles[m]}`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <input
          type="text"
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
            className="w-full bg-gray-300/60 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 z-0"
        />
      </div>
    </div>
  );
}
