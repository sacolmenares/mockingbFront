import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Info, CircleX } from 'lucide-react';


let isStyleInjected = false;
function injectAnimationStyles() {
  if (isStyleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.innerHTML = animationcss;
  document.head.appendChild(style);
  isStyleInjected = true;
}


const defaultPanels = [
  { uid: "p1", id: 1, title: "", type: "request" },
  { uid: "p2", id: 2, title: "", type: "request" },
  { uid: "p3", id: 3, title: "", type: "latency" },
  { uid: "p4", id: 4, title: "", type: "error" },
  { uid: "p5", id: 5, title: "", type: "resource" },
];

const timeRangeOptions = [
  { label: "Último minuto", value: "now-1m&to=now" },
  { label: "Últimos 5 minutos", value: "now-5m&to=now" },
  { label: "Últimos 10 minutos", value: "now-10m&to=now" },
  { label: "Última hora", value: "now-1h&to=now" }, // Valor por defecto
  { label: "Últimas 3 horas", value: "now-3h&to=now" },
  { label: "Últimas 6 horas", value: "now-6h&to=now" },
  { label: "Últimas 24 horas", value: "now-24h&to=now" },
];

export function PanelMetricas() {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [dashboardId, setDashboardId] = useState("addn4pp");
  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);
  const [tempDashboardId, setTempDashboardId] = useState(dashboardId);
  const [panels, setPanels] = useState(defaultPanels);
  const [filter] = useState("");
  const [timeRange, setTimeRange] = useState(timeRangeOptions[1].value);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    injectAnimationStyles();

    const savedConfig = localStorage.getItem("dashboardConfig");
    if (savedConfig) {
      const { baseUrl, dashboardId, timeRange, panels } = JSON.parse(savedConfig);
      setBaseUrl(baseUrl);
      setDashboardId(dashboardId);
      setTempBaseUrl(baseUrl);
      setTempDashboardId(dashboardId);
      setTimeRange(timeRange);
      setPanels(panels);
    }
  }, []);

  const aplicarCambios = () => {
    setBaseUrl(tempBaseUrl);
    setDashboardId(tempDashboardId);

    // Guardar todo en localStorage
    localStorage.setItem("dashboardConfig", JSON.stringify({
      baseUrl: tempBaseUrl,
      dashboardId: tempDashboardId,
      timeRange,
      panels
    }));
  };

  const handlePanelIdChange = (uid: string, inputValue: string) => {
    if (inputValue === "") {
      const updatedPanels = panels.map((panel) => 
        panel.uid === uid ? { ...panel, id: 0 } : panel
      );
      setPanels(updatedPanels);

      // Guardar en localStorage
      localStorage.setItem("dashboardConfig", JSON.stringify({
        baseUrl: tempBaseUrl,
        dashboardId: tempDashboardId,
        timeRange,
        panels: updatedPanels
      }));
      return;
    }

    const newId = parseInt(inputValue, 10);
    if (!isNaN(newId) && newId >= 0) {
      const updatedPanels = panels.map((panel) => {
        if (panel.uid === uid) {
          return { ...panel, id: newId };
        }
        return panel;
      });
      setPanels(updatedPanels);
    }
  };


  const removePanel = (uidToRemove: string) => {
    //Mínimo 3 paneles
    if (panels.length <= 3) {
      alert("Debes mantener al menos 3 paneles activos.");
      return;
    }
    setPanels(panels.filter((p) => p.uid !== uidToRemove));
  };


  const addPanel = () => {
    const newPanel = {
      uid: `new-${Date.now()}`,
      id: 0, 
      title: "",
      type: "request", 
    };
    setPanels([...panels, newPanel]);
  };


  const filteredPanels = panels.filter((p) => {
    if (!filter) return true; 
    const searchText = filter.toLowerCase();
    return p.title.toLowerCase().includes(searchText) ||
          p.type.toLowerCase().includes(searchText);
  });

  const panelBgClass = (type: string | undefined) => {
    switch (type) {
      case "error": return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300";
      case "latency": return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300";
      case "request": return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300";
      case "resource": return "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300";
      default: return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 p-8 rounded-3xl shadow-xl max-w-7xl mx-auto relative">
      <Button  onClick={() => {setShowInfoModal(true)}}
      variant="ghost"
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 
      dark:text-gray-300 absolute top-4 right-4"
      >
        <Info size={24} />
      </Button>
      {showInfoModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-xl mx-4 relative max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Cómo visualizar las métricas
          </h2>

          <p className="mb-3 text-gray-700 dark:text-gray-300">
            Esta sección te permite visualizar métricas de tus dashboards de Grafana de manera rápida y organizada.
          </p>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">1. URL Base</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            Por defecto es <code>http://localhost:3000</code>, ya que normalmente Grafana se ejecuta en tu computadora. <br />
            Si tu servidor Grafana está en otra dirección, cámbiala aquí.
          </p>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">2. Dashboard ID</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            Cada dashboard de Grafana tiene un ID único (por ejemplo: <code>addn4pp</code>). 
            <br/>Coloca aquí el ID del dashboard que quieres monitorear.
          </p>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">3. Frecuencia de actualización</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            Selecciona cada cuánto tiempo deseas actualizar los datos del panel: último minuto, última hora, últimas 24 horas, etc...
          </p>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">4. Paneles individuales</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            Cada cuadro representa un panel de métricas específico (requests, latencia, errores, recursos).  <br />
            - Ingresa el <strong>ID del panel</strong> correspondiente de Grafana.  <br />
            - Puedes agregar nuevos paneles con<span className="font-bold text-green-600 dark:text-green-400"><strong> + Agregar Panel </strong></span>. <br />
            - Para eliminar un panel, haz clic en ✕ (mínimo 3 paneles activos).
          </p>

          <h3 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">5. Visualización</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            Cada panel se muestra como un <em>iframe</em> que carga el gráfico correspondiente desde Grafana. <br /> 
            Puedes ver las métricas en tiempo real según el rango de tiempo seleccionado.
          </p>

          <p className="mb-3 text-gray-700 dark:text-gray-300">
            Una vez realizados los cambios, haz clic en <span className="font-bold text-green-600 dark:text-blue-400"><strong>"✓ Aplicar Cambios"</strong></span> para actualizar el panel.
          </p>

      <div className="flex justify-end mt-6">
        <Button
          onClick={() => setShowInfoModal(false)}
          variant="ghost"
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 
          dark:text-gray-300 absolute top-4 right-4"
        >
          <CircleX size={20} />
        </Button>
      </div>
    </div>
  </div>
)}

      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
        Métricas
      </h1>



      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm">
      <div className="flex gap-4 items-center flex-wrap">
        <input
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none"
            placeholder="URL Base"
            value={tempBaseUrl}
            onChange={(e) => setTempBaseUrl(e.target.value)}
          />
          <input
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl w-64 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 outline-none"
            placeholder="Dashboard ID (ej: addn4pp)"
            value={tempDashboardId}
            onChange={(e) => setTempDashboardId(e.target.value)}
          />
          <select
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl w-52 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 outline-none cursor-pointer"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
        <Button 
            variant="ghost" 
            gradientColors="from-blue-500 via-blue-600 to-blue-700"
            onClick={aplicarCambios}
            className=""
          >
          ✓ Aplicar Cambios
          </Button>
        </div>
      </div>

      <div className="grid grid-rows-1 md:grid-rows-2 lg:grid-rows-3 gap-6">
        {filteredPanels.map((p) => (
          <div
            key={p.uid}
            className={`p-6 rounded-3xl shadow-lg border relative group transition-all duration-300 hover:-translate-y-1 ${panelBgClass(p.type)} animate-fadeInUp`}
          >
            <div className="flex justify-between items-start mb-4">
               <h2 className="text-lg font-bold flex items-center gap-2 truncate">
                {p.title}
              </h2>
              
            {/* Minimo 3 paneles por defecto */}
              {panels.length > 3 && (
                <button 
                  onClick={() => removePanel(p.uid)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 font-bold p-1 rounded transition-colors"
                  title="Eliminar este panel"
                >
                  ✕
                </button>
              )}
            </div>


            <div className="mb-4">
              <label className="text-xs font-semibold opacity-70 dark:opacity-80 mb-1 block">
                Panel ID:
              </label>
              <input
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg w-20 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 outline-none bg-white/80 dark:bg-gray-800/80"
                placeholder="Ingresa ID"
                type="number"
                min="1" 
                value={p.id === 0 ? "" : p.id} 
                onChange={(e) => handlePanelIdChange(p.uid, e.target.value)} 
              />
            </div>

            {/* Iframe dinámico */}
            <div className="rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-inner border border-gray-100 dark:border-gray-700">
              <iframe
                src={`${baseUrl}/d-solo/${dashboardId}/mockingbird-metrics?orgId=1&panelId=${p.id}&from=${timeRange.split('&')[0]}&to=${timeRange.split('&')[1].replace('to=', '')}`}                width="100%"
                height="200"
                frameBorder="0"
                className="pointer-events-none" 
              ></iframe>
            </div>
          </div>
        ))}
      <div className="pt-6 flex justify-start">
      <Button 
        variant="ghost" 
        gradientColors="from-green-500 via-green-600 to-green-700"
        onClick={addPanel}
      >
      + Agregar Panel
      </Button>
      </div>
      </div>
    </div>
  );
}

const animationcss = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeInUp {
  animation: fadeInUp 0.5s ease-out forwards;
}
`;