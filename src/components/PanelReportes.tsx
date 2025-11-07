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



export function PanelReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina] = useState(10); // número de filas por página
  const [columnasVisibles, setColumnasVisibles] = useState<string[]>([
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


  // Obtener datos de la API
  const fetchReportes = async () => {
    try {
      const res = await fetch("/api/mock/data"); // Cambia a tu endpoint real
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();
  
      // ✅ Agregamos esta validación para evitar el error
      if (Array.isArray(data)) {
        setReportes(data);
      } else {
        console.warn("El endpoint no devolvió un arreglo. Se usará vacío.");
        setReportes([]); // evita que reportes sea null
      }
    } catch (error) {
      console.error("Error al obtener reportes:", error);
      setReportes([]); // también evita el error si falla el fetch
    }
  };
  

  useEffect(() => {
    fetchReportes();
  }, []);


  // Filtrado de datos
  const reportesFiltrados = (reportes || []).filter(r =>
    columnasVisibles.some(c => r[c]?.toString().toLowerCase().includes(filtro.toLowerCase()))
  );

  const indiceUltimo = paginaActual * porPagina;
  const indicePrimero = indiceUltimo - porPagina;
  const reportesPagina = reportesFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(reportesFiltrados.length / porPagina);

  

  // Alternar visibilidad de columnas
  const toggleColumna = (col: string) => {
    setColumnasVisibles(prev =>
      prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
    );
  };

  return (
    <div className="bg-gray-200 text-gray-800 p-8 rounded-2xl shadow-2xl max-w-7xl mx-auto animate-fadeIn">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Historial de reportes</h1>
      <div className="w-full mb-5">
        <input
          type="text"
          placeholder="Buscar en todos los reportes..."
          className="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 text-base shadow-sm"
          value={filtro}
          onChange={e => setFiltro(e.target.value)}
        />
      </div>


      <div className="flex flex-nowrap overflow-x-auto gap-2 pb-3 mb-4">
        {[
          "uuid",
          "recepcion_id",
          "sender_id",
          "timestamp",
          "request_endpoint",
          "request_method",
          "response_status_code",
          "request_body",
          "response_body",
        ].map(col => (
          <button
            key={col}
            className={`text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 
                        hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 
                        dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-3 py-1.5 
                        text-center transition-all duration-300 whitespace-nowrap ${
                          !columnasVisibles.includes(col) ? "opacity-60 hover:opacity-100" : ""
                        }`}
            onClick={() => toggleColumna(col)}
          >
            {col}
          </button>
        ))}
      </div>



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
          {reportesPagina.map((reporte, i) => (
              <tr key={i} className="hover:bg-gray-100 transition-all">
                {columnasVisibles.map(col => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {col === "request_body" || col === "response_body"
                      ? String(reporte[col]).slice(0, 80) + "..."
                      : String(reporte[col])}
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
              <div className="flex justify-center items-center mt-4 gap-2">
        <button
          onClick={() => setPaginaActual(prev => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
        >
          ← Anterior
        </button>

        <span className="text-gray-700 text-sm">
          Página {paginaActual} de {totalPaginas}
        </span>

        <button
          onClick={() => setPaginaActual(prev => Math.min(prev + 1, totalPaginas))}
          disabled={paginaActual === totalPaginas}
          className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
      </div>
    </div>
  );
}
