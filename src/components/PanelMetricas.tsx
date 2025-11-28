import { useState } from "react";

export function PanelMetricas() {
  const [dashboardId, setDashboardId] = useState("addn4pp");

  return (
    <div className="bg-gray-100 p-8 rounded-3xl shadow-xl max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">
        Panel de Métricas
      </h1>

      <div className="flex gap-4 mb-8 justify-center">
        <input
          className="p-3 border rounded-xl w-80"
          placeholder="Dashboard ID (ej: addn4pp)"
          value={dashboardId}
          onChange={(e) => setDashboardId(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-8">
        <iframe
          src={`http://localhost:3000/d/${dashboardId}/mockingbird-metrics?orgId=1&from=now-1h&to=now&timezone=browser`}
          width="100%"
          height="800"
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
}
