import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

interface LatencyProps {
  value?: number;
  onChange?: (value: number) => void;
}
export default function Latency({ value, onChange }: LatencyProps) {
  const isControlled = typeof value === "number" && typeof onChange === "function";
  const [valor, setValor] = useState<number>(isControlled ? value! : 0);
  const [inputValue, setInputValue] = useState<string>("");

  // Mantener sincronizado en modo controlado
  useEffect(() => {
    if (isControlled) {
      setValor(value!);
      setInputValue(String(value!));
    }
  }, [isControlled, value]);

  const handleSlider = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = Number(e.target.value);
    if (isControlled) {
      onChange!(newVal);
    } else {
      setValor(newVal);
      setInputValue(String(newVal));
    }
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    if (raw === "") {
      // Permite dejar el input vacío sin forzar mostrar 0
      return;
    }

    const val = Number(raw);
    if (!Number.isNaN(val) && val >= 0 && val <= 5000) {
      if (isControlled) {
        onChange!(val);
      } else {
        setValor(val);
      }
    }
  };

  // Calcula el porcentaje del slider (para colorear la barra)
  const porcentaje = (valor / 5000) * 100;

  return (
    <div className="w-full flex items-center gap-4 p-4">

      <div className="relative w-full">
        <input
          type="range"
          min="0"
          max="5000"
          value={valor}
          onChange={handleSlider}
          className="w-full appearance-none bg-transparent cursor-pointer"
          style={{
            background: `linear-gradient(to right, #22c55e ${porcentaje}%, #e5e7eb ${porcentaje}%)`,
            height: "8px",
            borderRadius: "9999px",
          }}
        />

        <style>
          {`
            input[type='range']::-webkit-slider-thumb {
              appearance: none;
              width: 16px;
              height: 16px;
              background: #16a34a;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 4px rgba(0,0,0,0.3);
              transition: transform 0.2s ease, background 0.2s ease;
            }
            input[type='range']::-webkit-slider-thumb:hover {
              transform: scale(1.2);
              background: #22c55e;
            }
            input[type='range']::-moz-range-thumb {
              width: 16px;
              height: 16px;
              background: #16a34a;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 4px rgba(0,0,0,0.3);
              transition: transform 0.2s ease, background 0.2s ease;
            }
            input[type='range']::-moz-range-thumb:hover {
              transform: scale(1.2);
              background: #22c55e;
            }
          `}
        </style>
      </div>


      <div className="flex items-center gap-2 flex-shrink-0">
        <input
          type="number"
          min="0"
          max="5000"
          value={inputValue}
          onChange={handleInput}
          placeholder="0"
          className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg p-1 text-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200
                     focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-600 transition-all duration-200"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">ms</span>
      </div>
    </div>
  );
}
