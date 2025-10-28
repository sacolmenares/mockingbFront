import { useEffect, useState } from "react";

// Animación CSS
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
`;
document.head.appendChild(style);

interface Reporte {
  recepcion_id: string;
  request_body: string;
  request_endpoint: string;
  request_method: string;
  response_body: string;
  response_status_code: number;
  sender_id: string;
  timestamp: string;
  uuid: string;
  [key: string]: any;
}

interface PanelReportesProps {
  reportesCount: number;
  onReportesVistos: () => void;
}

export function PanelReportes({ reportesCount, onReportesVistos }: PanelReportesProps) {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filtro, setFiltro] = useState("");
  const [columnasVisibles, setColumnasVisibles] = useState<string[]>([
    "timestamp",
    "request_method",
    "request_endpoint",
    "response_status_code",
    "response_body",
  ]);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);

  // Obtener datos de la API
  const fetchReportes = async () => {
    try {
      const res = await fetch("/api/mock/data"); 
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      setReportes(data);
    } catch (error) {
      console.error("Error al obtener reportes:", error);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  // Mostrar mensaje si hay nuevos reportes
  useEffect(() => {
    if (reportesCount > 0) {
      setMostrarMensaje(true);
      const timer = setTimeout(() => {
        onReportesVistos();
        setMostrarMensaje(false);
      }, 5000);

      const handleVisibilityChange = () => {
        if (document.hidden) {
          onReportesVistos();
          setMostrarMensaje(false);
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearTimeout(timer);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [reportesCount, onReportesVistos]);

 
  const reportesFiltrados = reportes.filter(r =>
    columnasVisibles.some(c => r[c]?.toString().toLowerCase().includes(filtro.toLowerCase()))
  );


  const toggleColumna = (col: string) => {
    setColumnasVisibles(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="bg-gray-200 text-gray-800 p-8 rounded-2xl shadow-2xl max-w-7xl mx-auto animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Historial de reportes</h1>

<div className="w-full mb-3">
  <input
    type="text"
    placeholder="Buscar..."
    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-base"
    value={filtro}
    onChange={e => setFiltro(e.target.value)}
  />
</div>


<div className="flex flex-nowrap overflow-x-auto gap-2 pb-2 mb-4">
  {["timestamp", "request_method", "request_endpoint", "response_status_code", "response_body"].map(col => (
    <button
      key={col}
      className={`text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
                  hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 
                  dark:focus:ring-blue-800 font-medium rounded-lg text-m px-3 py-1.5 
                  text-center transition-all duration-300 whitespace-nowrap ${
                    !columnasVisibles.includes(col) ? "opacity-60 hover:opacity-100" : ""
                  }`}
      onClick={() => toggleColumna(col)}
    >
      {col}
    </button>
  ))}
</div>


      {mostrarMensaje && reportesCount > 0 && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
          <p className="font-medium text-lg">¡Se aplicaron {reportesCount} ajuste(s) exitosamente!</p>
          <p className="text-sm mt-1">Los reportes correspondientes estarán disponibles próximamente.</p>
        </div>
      )}

      <div className="overflow-x-auto mt-6 bg-white rounded-2xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columnasVisibles.map(col => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportesFiltrados.map((reporte, i) => (
              <tr key={i} className="hover:bg-gray-100 transition-all">
                {columnasVisibles.map(col => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {String(reporte[col])}
                  </td>
                ))}
              </tr>
            ))}
            {reportesFiltrados.length === 0 && (
              <tr>
                <td colSpan={columnasVisibles.length} className="px-6 py-4 text-center text-gray-400">
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
