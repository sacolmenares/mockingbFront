import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Info, CircleX, CircleCheck } from 'lucide-react';
import { animationLoadingLogo as AnimationLoadingLogo } from "./animationLogo";
import { motion, AnimatePresence } from "framer-motion";

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
  const [baseUrl, setBaseUrl] = useState(() => {
    try {
      return localStorage.getItem("metrics_base_url") || "http://localhost:3000";
    } catch { return "http://localhost:3000"; }
  });
  const [dashboardId, setDashboardId] = useState(() => {
    try {
      return localStorage.getItem("metrics_dashboard_id") || "id dashboard";
    } catch { return "id dashboard"; }
  });
  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);
  const [tempDashboardId, setTempDashboardId] = useState(dashboardId);
  const [panels, setPanels] = useState(() => {
    try {
      const saved = localStorage.getItem("metrics_panels");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : defaultPanels;
      }
    } catch (e) {
      console.error("Error cargando paneles desde localStorage", e);
    }
    return defaultPanels;
  });
  const [filter] = useState("");
  const [timeRange, setTimeRange] = useState(() => {
    try {
      return localStorage.getItem("metrics_time_range") || timeRangeOptions[1].value;
    } catch { return timeRangeOptions[1].value; }
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  //Cargar datos desde la bd
  const fetchMetricsConfig = async () => {
    try {
      const res = await fetch("/api/mock/config/metrics");
      if (!res.ok) return;

      const data = await res.json();
      if (!data || Object.keys(data).length === 0) return;

      // Solo actualizamos si el backend tiene datos reales
      if (data.base_url) {
        setBaseUrl(data.base_url);
        setTempBaseUrl(data.base_url);
        localStorage.setItem("metrics_base_url", data.base_url);
      }
      if (data.dashboard_id) {
        setDashboardId(data.dashboard_id);
        setTempDashboardId(data.dashboard_id);
        localStorage.setItem("metrics_dashboard_id", data.dashboard_id);
      }
      if (data.time_range) {
        setTimeRange(data.time_range);
        localStorage.setItem("metrics_time_range", data.time_range);
      }

      if (data.panels && Array.isArray(data.panels) && data.panels.length > 0) {
        // Aseguramos que cada panel tenga un uid único para el frontend
        const panelsWithUids = data.panels.map((p: any, i: number) => ({
          ...p,
          uid: p.uid || `p-${i}-${Date.now()}`
        }));
        setPanels(panelsWithUids);
        localStorage.setItem("metrics_panels", JSON.stringify(panelsWithUids));
      }
    } catch (err) {
      console.error("Error cargando configuración de métricas desde el servidor", err);
    }
  };


  useEffect(() => {
    injectAnimationStyles();
    fetchMetricsConfig();
  }, []);


  const aplicarCambios = async () => {
    setIsSaving(true);

    // Sincronizar UI local inmediatamente para máxima fluidez
    setBaseUrl(tempBaseUrl);
    setDashboardId(tempDashboardId);

    // Persistencia local inmediata
    localStorage.setItem("metrics_base_url", tempBaseUrl);
    localStorage.setItem("metrics_dashboard_id", tempDashboardId);
    localStorage.setItem("metrics_time_range", timeRange);

    // Solo guardamos paneles si es un array válido
    if (Array.isArray(panels)) {
      localStorage.setItem("metrics_panels", JSON.stringify(panels));
    }

    // Limpiamos los paneles para no enviar el 'uid' al backend (que es solo para el front)
    const cleanedPanels = Array.isArray(panels)
      ? panels.map(({ uid, ...rest }) => rest)
      : [];

    try {
      await fetch("/api/mock/config/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base_url: tempBaseUrl,
          dashboard_id: tempDashboardId,
          time_range: timeRange,
          panels: cleanedPanels,
        }),
      });

      // El éxito visual es casi inmediato gracias a la persistencia local
      setShowSuccessAlert(true);

      // Siempre cerramos la carga después de 4s para mantener el UX premium
      setTimeout(() => {
        setShowSuccessAlert(false);
        setIsSaving(false);
      }, 4000);

    } catch (err) {
      console.error("Error síncronizando con el servidor", err);
      // Fallback de seguridad: la UI ya tiene los datos locales, solo liberamos el bloqueo
      setTimeout(() => {
        setIsSaving(false);
        setShowSuccessAlert(false);
      }, 1000);
    }
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
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">
          <div className="flex flex-col items-center gap-2 w-48 h-48">
            <AnimationLoadingLogo />
          </div>
        </div>
      )}

      {showSuccessAlert && (
        <div
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[110] alert alert-success flex items-center gap-4 shadow-lg rounded-md p-4 bg-green-500 text-white"
          role="alert"
        >
          <span><CircleCheck size={20} /> </span>
          <p className="text-xl font-italic dark:text-white">
            Cambios aplicados correctamente
          </p>
        </div>
      )}
      <Button onClick={() => { setShowInfoModal(true) }}
        variant="ghost"
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 
      dark:text-gray-300 absolute top-4 right-4"
      >
        <Info size={24} />
      </Button>
      <AnimatePresence mode="sync">
        {showInfoModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-[100]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="absolute inset-0 backdrop-blur-sm"
              onClick={() => setShowInfoModal(false)}
            />

            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.08, ease: "easeOut" }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-xl mx-4 max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
            >
              <button
                onClick={() => setShowInfoModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Cerrar"
              >
                <CircleX size={24} />
              </button>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Info className="text-blue-500" />
                Cómo visualizar las métricas
              </h2>

              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Esta sección te permite visualizar métricas de tus dashboards de Grafana de manera rápida y organizada.
                </p>

                <section>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">1. URL Base</h3>
                  <p className="text-sm">
                    Por defecto es <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">http://localhost:3000</code>, ya que normalmente Grafana se ejecuta en tu computadora. Si tu servidor Grafana está en otra dirección, cámbiala aquí.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">2. Dashboard ID</h3>
                  <p className="text-sm">
                    Cada dashboard de Grafana tiene un ID único (por ejemplo: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">addn4pp</code>). Coloca aquí el ID del dashboard que quieres monitorear.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">3. Frecuencia de actualización</h3>
                  <p className="text-sm">
                    Selecciona cada cuánto tiempo deseas actualizar los datos del panel: último minuto, última hora, últimas 24 horas, etc.
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">4. Paneles individuales</h3>
                  <p className="text-sm">
                    Cada cuadro representa un panel de métricas específico (requests, latencia, errores, recursos). Ingresa el <strong>ID del panel</strong> correspondiente de Grafana. Puedes agregar nuevos paneles con <span className="font-bold text-green-600 dark:text-green-400">"+ Agregar Panel"</span>. Para eliminar un panel, haz clic en ✕ (mínimo 3 paneles activos).
                  </p>
                </section>

                <section>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">5. Visualización</h3>
                  <p className="text-sm">
                    Cada panel se muestra como un <em>iframe</em> que carga el gráfico correspondiente desde Grafana. Puedes ver las métricas en tiempo real según el rango de tiempo seleccionado.
                  </p>
                </section>

                <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm">
                    Una vez realizados los cambios, haz clic en <span className="font-bold text-blue-600 dark:text-blue-400">"✓ Aplicar Cambios"</span> para actualizar el panel.
                  </p>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                src={`${baseUrl}/d-solo/${dashboardId}/mockingbird-metrics?orgId=1&panelId=${p.id}&from=${timeRange.split('&')[0]}&to=${timeRange.split('&')[1].replace('to=', '')}`} width="100%"
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