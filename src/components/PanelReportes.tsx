import { useEffect, useState } from "react";
import { ChevronRight , ChevronLeft} from "lucide-react";

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

export function PanelReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina] = useState(10);
  const [columnasVisibles] = useState<string[]>([
    "uuid",
    "recepcion_id",
    "sender_id",
    "timestamp",
    "request_endpoint",
    "request_method",
    "response_status_code",
    "request_body",
    "response_body",
  ]);

  const [columnasFiltro, setColumnasFiltro] = useState<string[]>([]);

  const columnas = [
    "uuid",
    "recepcion_id",
    "sender_id",
    "timestamp",
    "request_endpoint",
    "request_method",
    "response_status_code",
    "request_body",
    "response_body",
  ];

  // Fetch de datos
  const fetchReportes = async () => {
    try {
      const res = await fetch("/api/mock/data");
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
      setReportes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setReportes([]);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  // Filtrado
  const reportesFiltrados = reportes.filter(r => {
    if (!filtro) return true;
    const texto = filtro.toLowerCase();
    if (columnasFiltro.length > 0) {
      return columnasFiltro.some(c =>
        r[c]?.toString().toLowerCase().includes(texto)
      );
    } else {
      return columnasVisibles.some(c =>
        r[c]?.toString().toLowerCase().includes(texto)
      );
    }
  });

  const indiceUltimo = paginaActual * porPagina;
  const indicePrimero = indiceUltimo - porPagina;
  const reportesPagina = reportesFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(reportesFiltrados.length / porPagina);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Historial de Reportes
      </h1>


      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>


      <div className="flex flex-wrap gap-2 mb-4">
        {columnas.map(col => (
          <button
            key={col}
            className={`px-4 py-1 rounded-full text-sm font-medium transition-all
              ${
                columnasFiltro.includes(col)
                  ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 hover:text-white"
              }`}
            onClick={() => {
              setColumnasFiltro(prev =>
                prev.includes(col)
                  ? prev.filter(c => c !== col)
                  : [...prev, col]
              );
            }}
          >
            {col.replace(/_/g, " ")}
          </button>
        
        ))}
      </div>


      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {columnasVisibles.map(col => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {reportesPagina.map((r, i) => (
              <tr
                key={i}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {columnasVisibles.map(col => (
                  <td
                    key={col}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {["request_body", "response_body"].includes(col)
                      ? String(r[col]).slice(0, 80) + "..."
                      : r[col]}
                  </td>
                ))}
              </tr>
            ))}
            {reportesFiltrados.length === 0 && (
              <tr>
                <td
                  colSpan={columnasVisibles.length}
                  className="px-6 py-4 text-center text-gray-400 dark:text-gray-500"
                >
                  No se encontraron resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2 mt-4 flex-wrap">
        <button
          onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <ChevronLeft />
        </button>

        {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
          <button
            key={num}
            onClick={() => setPaginaActual(num)}
            className={`px-3 py-1 rounded-lg transition-colors
              ${
                num === paginaActual
                  ? "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-md"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 hover:text-white"
              }`}
            >
            {num}
          </button>
        
        ))}

        <button
          onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
