import { useState, useEffect } from "react";
import { Button } from "./Button"


let isStyleInjected = false;
function injectAnimationStyles() {
  if (isStyleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.innerHTML = animationcss;
  document.head.appendChild(style);
  isStyleInjected = true;
}


const defaultPanels = [
  { id: 1, title: "Requests Totales", type: "request" },
  { id: 2, title: "Requests Activos", type: "request" },
  { id: 3, title: "Latencia del Servicio", type: "latency" },
  { id: 4, title: "Errores (500)", type: "error" },
  { id: 5, title: "Uso de Recursos", type: "resource" },
];

export function PanelMetricas() {
  const [dashboardId, setDashboardId] = useState("addn4pp");
  const [panels, setPanels] = useState(defaultPanels);

  useEffect(() => {
    injectAnimationStyles();
  }, []);

  
  const [filter, setFilter] = useState("all");
  const filteredPanels = panels.filter(p => filter === "all" ? true : p.type === filter);

  
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

     
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center items-center">
        <input
          className="p-3 border rounded-xl w-80"
          placeholder="Dashboard ID (ej: addn4pp)"
          value={dashboardId}
          onChange={(e) => setDashboardId(e.target.value)}
        />

        <div className="flex gap-2">
          {["all","request","latency","error","resource"].map(f => (
            <Button
              key={f}
              variant="ghost"
              gradientColors="from-blue-500 via-blue-600 to-blue-700"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

     
      <div className="flex flex-col gap-6">
        {filteredPanels.map((p) => (
          <div
            key={p.id}
            className={`p-6 rounded-3xl shadow-lg border ${panelBgClass(p.type)} animate-fadeInUp`}
          >
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {p.title}
            </h2>
            <iframe
              src={`http://localhost:3000/d-solo/${dashboardId}/mockingbird-metrics?orgId=1&panelId=${p.id}&from=now-1h&to=now`}
              width="100%"
              height="250"
              frameBorder="0"
            ></iframe>
          </div>
        ))}
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