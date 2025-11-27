import { useEffect } from "react";

const animationcss = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
`;

let isStyleInjected = false;

function injectAnimationStyles() {
  if (isStyleInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.innerHTML = animationcss;
  document.head.appendChild(style);
  isStyleInjected = true;
}

export function PanelMetricas() {
  useEffect(() => {
    injectAnimationStyles();
  }, []);

  return (
    <div className="bg-gray-100 p-8 rounded-3xl shadow-xl max-w-7xl mx-auto animate-fadeIn">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
        Panel de Métricas
      </h1>

      <div className="flex flex-col gap-8">

        {/* Latencia del Servicio */}
        <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 p-6 rounded-3xl shadow-lg border border-blue-200">
          <h2 className="text-2xl font-semibold mb-3 text-blue-700 flex items-center gap-2">
            Latencia del Servicio
          </h2>
          <iframe
            src="http://localhost:3000/d-solo/addn4pp/mockingbird-metrics?orgId=1&panelId=panel-3&from=now-1h&to=now&__feature.dashboardSceneSolo=true"
            width="100%"
            height="300"
            frameBorder="0"
          ></iframe>
        </div>

        {/* Requests Totales */}
        <div className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 p-6 rounded-3xl shadow-lg border border-green-200">
          <h2 className="text-2xl font-semibold mb-3 text-green-700 flex items-center gap-2">
            Requests Totales
          </h2>
          <iframe
            src="http://localhost:3000/d-solo/addn4pp/mockingbird-metrics?orgId=1&panelId=panel-1&from=now-1h&to=now&__feature.dashboardSceneSolo=true"
            width="100%"
            height="300"
            frameBorder="0"
          ></iframe>
        </div>

        {/* Requests Activos */}
        <div className="bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 p-6 rounded-3xl shadow-lg border border-purple-200">
          <h2 className="text-2xl font-semibold mb-3 text-purple-700 flex items-center gap-2">
            Requests Activos
          </h2>
          <iframe
            src="http://localhost:3000/d-solo/addn4pp/mockingbird-metrics?orgId=1&panelId=panel-2&from=now-1h&to=now&__feature.dashboardSceneSolo=true"
            width="100%"
            height="300"
            frameBorder="0"
          ></iframe>
        </div>

        {/* Errores */}
        <div className="bg-gradient-to-r from-red-50 via-red-100 to-red-50 p-6 rounded-3xl shadow-lg border border-red-200">
          <h2 className="text-2xl font-semibold mb-3 text-red-600 flex items-center gap-2">
           Errores (500)
          </h2>
          <iframe
            src="http://localhost:3000/d-solo/addn4pp/mockingbird-metrics?orgId=1&panelId=panel-4&from=now-1h&to=now&__feature.dashboardSceneSolo=true"
            width="100%"
            height="200"
            frameBorder="0"
          ></iframe>
        </div>


        {/*
        <div className="bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 p-6 rounded-3xl shadow-lg border border-yellow-200">
          <h2 className="text-2xl font-semibold mb-3 text-yellow-700 flex items-center gap-2">
            Éxito / Error
          </h2>
          <iframe
            src="http://localhost:3000/d-solo/addn4pp/mockingbird-metrics?orgId=1&panelId=panel-qa-success-rate&from=now-1h&to=now&__feature.dashboardSceneSolo=true"
            width="100%"
            height="150"
            frameBorder="0"
          ></iframe>
        </div>
          */}
          
    	  {/*
        <div className="bg-gradient-to-r from-indigo-50 via-indigo-100 to-indigo-50 p-6 rounded-3xl shadow-lg border border-indigo-200">
          <h2 className="text-2xl font-semibold mb-3 text-indigo-700 flex items-center gap-2">
            Latencia p50 / p95 / p99
          </h2>
          <iframe
            src="http://localhost:3000/d-solo/addn4pp/mockingbird-metrics?orgId=1&panelId=panel-qa-latency-percentiles&from=now-1h&to=now&__feature.dashboardSceneSolo=true"
            width="100%"
            height="200"
            frameBorder="0"
          ></iframe>
        </div>
        */}

        {/* Uso de Recursos */}
        <div className="bg-gradient-to-r from-pink-50 via-pink-100 to-pink-50 p-6 rounded-3xl shadow-lg border border-pink-200">
          <h2 className="text-2xl font-semibold mb-3 text-pink-700 flex items-center gap-2">
            Uso de Recursos
          </h2>
          <iframe
            src="http://localhost:3000/d-solo/addn4pp/mockingbird-metrics?orgId=1&from=1764271869651&to=1764271876723&timezone=browser&panelId=panel-7&__feature.dashboardSceneSolo=true"
            width="100%"
            height="200"
            frameBorder="0"
          ></iframe>
        </div>

      </div>
    </div>
  );
}
