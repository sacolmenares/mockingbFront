import { useState, useEffect } from "react";
import { Button } from "./Button";


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

  useEffect(() => {
    injectAnimationStyles();
  }, []);

  const aplicarCambios = () => {
    setBaseUrl(tempBaseUrl);
    setDashboardId(tempDashboardId);
  };

  const handlePanelIdChange = (uid: string, inputValue: string) => {
    if (inputValue === "") {
      const updatedPanels = panels.map((panel) => 
        panel.uid === uid ? { ...panel, id: 0 } : panel
      );
      setPanels(updatedPanels);
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
      case "error": return "bg-red-50 border-red-200 text-red-700";
      case "latency": return "bg-blue-50 border-blue-200 text-blue-700";
      case "request": return "bg-green-50 border-green-200 text-green-700";
      case "resource": return "bg-pink-50 border-pink-200 text-pink-700";
      default: return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="bg-gray-100 p-8 rounded-3xl shadow-xl max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
        Panel de Métricas
      </h1>


      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
      <div className="flex gap-4 items-center flex-wrap">
        <input
            className="p-3 border rounded-xl w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="URL Base"
            value={tempBaseUrl}
            onChange={(e) => setTempBaseUrl(e.target.value)}
          />
          <input
            className="p-3 border rounded-xl w-64 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Dashboard ID (ej: addn4pp)"
            value={tempDashboardId}
            onChange={(e) => setTempDashboardId(e.target.value)}
          />
          <select
            className="p-3 border rounded-xl w-52 bg-white focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
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
                  className="text-gray-400 hover:text-red-500 font-bold p-1 rounded transition-colors"
                  title="Eliminar este panel"
                >
                  ✕
                </button>
              )}
            </div>


            <div className="mb-4">
              <label className="text-xs font-semibold opacity-70 mb-1 block">
                Panel ID:
              </label>
              <input
                className="p-2 border border-gray-300 rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-400 outline-none bg-white/80"
                placeholder="Ingresa ID"
                type="number"
                min="1" 
                value={p.id === 0 ? "" : p.id} 
                onChange={(e) => handlePanelIdChange(p.uid, e.target.value)} 
              />
            </div>

            {/* Iframe dinámico */}
            <div className="rounded-xl overflow-hidden bg-white shadow-inner border border-gray-100">
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