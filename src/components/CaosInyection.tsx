import { ChevronDown } from "lucide-react";
import { useState, type ChangeEvent } from "react";

interface InyeccionDelCaosProps {
    inyeccionCaos: boolean;
    setInyeccionCaos: React.Dispatch<React.SetStateAction<boolean>>;
    porcentajeFallo: number;
    setPorcentajeFallo: React.Dispatch<React.SetStateAction<number>>;
    codigoCaos: number | null;
    setCodigoCaos: React.Dispatch<React.SetStateAction<number | null>>;
  }
  

export function InyeccionDelCaos({
  inyeccionCaos,
  setInyeccionCaos,
  porcentajeFallo,
  setPorcentajeFallo,
  codigoCaos,
  setCodigoCaos,
}: InyeccionDelCaosProps) {
  const [isOpen, setIsOpen] = useState(false);

  const codigosCaos = [
    { value: 400, label: "400 Bad Request" },
    { value: 401, label: "401 Unauthorized" },
    { value: 404, label: "404 Not Found" },
    { value: 500, label: "500 Internal Server Error" },
    { value: 503, label: "503 Service Unavailable" },
  ];

  return (
    <div className="bg-gray-100/70 p-4 rounded-2xl shadow-sm border border-gray-200 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-gray-700">Inyección del Caos</span>
        <button
          onClick={() => setInyeccionCaos(!inyeccionCaos)}
          className={`px-4 py-1 text-sm font-semibold rounded-full transition-all duration-300 ${
            inyeccionCaos
              ? "bg-green-500 text-white shadow-md"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          {inyeccionCaos ? "SÍ" : "NO"}
        </button>
      </div>

      {/* Configuración extra si está activo */}
      {inyeccionCaos && (
        <div
          className="mt-3 space-y-3 animate-fadeIn"
          style={{ animation: "fadeIn 0.4s ease-in-out" }}
        >
          {/* Porcentaje de fallo */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              % de fallo
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={porcentajeFallo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const valor = e.target.value;
                const numero = Number(valor);
                if (valor === '' || (numero >= 0 && numero <= 100)) {
                  setPorcentajeFallo(numero);
                }
              }}
                        
              className="w-full bg-gray-200 p-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>


          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              Código caos (?)
            </label>
            <div className="relative">
              <select
                value={codigoCaos || 500}
                onMouseDown={() => setIsOpen(true)}
                onChange={(e) => {
                  setCodigoCaos(Number(e.target.value));
                  setIsOpen(false);
                }}
                onBlur={() => setIsOpen(false)}
                className="w-full bg-gray-200 p-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none pr-10"
              >
                {codigosCaos.map((codigo) => (
                  <option key={codigo.value} value={codigo.value}>
                    {codigo.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-500 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pequeña animación al aparecer (si usas Tailwind v3 o v4, puedes agregar en globals.css)
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.4s ease-in-out;
}
`;
document.head.appendChild(style);
