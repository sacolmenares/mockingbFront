import { useEffect, useState } from "react";
import { ChevronRight, ChevronLeft, Copy, X } from "lucide-react";


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

//Hacer más visual los códigos de estado
const getStatusBadge = (code: number) => {
  if (code >= 200 && code < 300) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
  if (code >= 300 && code < 400) return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
  if (code >= 400 && code < 500) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800";
  if (code >= 500) return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
  return "bg-gray-100 text-gray-800 border-gray-200";
};

//Hacer más visual los métodos
const getMethodColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET": return "text-green-600 dark:text-green-400 font-bold";
    case "POST": return "text-yellow-600 dark:text-yellow-400 font-bold";
    case "PUT": return "text-blue-600 dark:text-blue-400 font-bold";
    case "DELETE": return "text-red-600 dark:text-red-400 font-bold";
    default: return "text-gray-600 dark:text-gray-400";
  }
};

const CopyButton = ({ text }: { text: string }) => (
  <button
    onClick={(e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(text);
    }}
    className="ml-2 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md text-gray-500 dark:text-gray-400 transition-colors"
    title="Copiar al portapapeles"
  >
    <Copy size={14} />
  </button>
);

const JsonViewer = ({ data }: { data: string }) => {
  try {
    const jsonObj = JSON.parse(data);
    return (
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-gray-700 shadow-inner">
        {JSON.stringify(jsonObj, null, 2)}
      </pre>
    );
  } catch (e) {
    return <p className="text-red-500 text-sm italic">Raw data (No JSON): {data}</p>;
  }
};

export function PanelReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina] = useState(10);
  const [reporteSeleccionado, setReporteSeleccionado] = useState<Reporte | null>(null);
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

    const intervalo = setInterval(() => {
      fetchReportes();
    }, 2000);

    return () => clearInterval(intervalo);
  },);


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
              ${columnasFiltro.includes(col)
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
                onClick={() => setReporteSeleccionado(r)}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
              >
                {columnasVisibles.map(col => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200"
                  >
                    {col === "response_status_code" ? (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(r[col])}`}>
                        {r[col]}
                      </span>

                    ) : col === "request_method" ? (
                      <span className={getMethodColor(r[col])}>{r[col]}</span>

                    ) : col === "uuid" || col === "recepcion_id" ? (
                      <div className="flex items-center font-mono text-xs text-gray-500">
                        {String(r[col]).slice(0, 8)}...
                        <CopyButton text={r[col]} />
                      </div>

                    ) : ["request_body", "response_body"].includes(col) ? (
                      <span className="font-mono text-xs text-gray-400">
                        {String(r[col]).slice(0, 30)}...
                      </span>

                    ) : (
                      r[col]
                    )}
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
              ${num === paginaActual
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

      {/* Modal de Detalles de una fila*/}
      {reporteSeleccionado && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setReporteSeleccionado(null)}
          />

          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start bg-gray-50 dark:bg-gray-800">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-md text-sm font-bold border ${getStatusBadge(reporteSeleccionado.response_status_code)}`}>
                    {reporteSeleccionado.response_status_code}
                  </span>
                  <span className={`text-xl font-bold ${getMethodColor(reporteSeleccionado.request_method)}`}>
                    {reporteSeleccionado.request_method}
                  </span>
                </div>
                <p className="font-mono text-sm text-gray-600 dark:text-gray-300 break-all">
                  {reporteSeleccionado.request_endpoint}
                </p>
              </div>
              <button onClick={() => setReporteSeleccionado(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <X size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                  <span className="text-xs uppercase font-bold text-gray-500">UUID</span>
                  <div className="flex justify-between mt-1">
                    <code className="text-sm dark:text-white">{reporteSeleccionado.uuid}</code>
                    <CopyButton text={reporteSeleccionado.uuid} />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border dark:border-gray-700">
                  <span className="text-xs uppercase font-bold text-gray-500">Timestamp</span>
                  <div className="mt-1 text-sm dark:text-white">{reporteSeleccionado.timestamp}</div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">Request Body</h3>
                  <CopyButton text={reporteSeleccionado.request_body} />
                </div>
                <JsonViewer data={reporteSeleccionado.request_body} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">Response Body</h3>
                  <CopyButton text={reporteSeleccionado.response_body} />
                </div>
                <JsonViewer data={reporteSeleccionado.response_body} />
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
