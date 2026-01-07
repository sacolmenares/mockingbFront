import { useEffect, useState } from "react";
import { Sun, Moon, RotateCcw } from "lucide-react"; 

export function PageHeader() {
  const [servidorActivo, setServidorActivo] = useState<boolean | null>(null);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement; 
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const verificarServidor = async () => {
      try {
        const res = await fetch("/api/mock/data", { method: "GET" });  
        setServidorActivo(res.ok);
      } catch {
        setServidorActivo(false);
      }
    };
    verificarServidor();
    const intervalo = setInterval(verificarServidor, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const gradiente =
    servidorActivo === null
      ? "from-gray-300 via-gray-400 to-gray-500"
      : servidorActivo
      ? "from-green-400 via-green-500 to-green-600"
      : "from-red-400 via-red-500 to-red-600";

  const titulo =
    servidorActivo === null
      ? "Verificando estado del servidor..."
      : servidorActivo
      ? "Servidor activo"
      : "Servidor apagado";

  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 shadow-md z-10 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="flex items-center gap-2">
        <img 
          src={darkMode ? "/LogoDark.svg" : "/LogoLight.svg"} 
          className="h-[90px] w-[90px] object-contain" 
          alt="Logo" 
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            window.location.reload();
          }}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
        >
          <RotateCcw size={18} />
        </button>

        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
        >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium italic hidden sm:block">
            Estado del servidor
          </span>
          <div
            className={`w-28 h-8 rounded-full bg-gradient-to-r ${gradiente} shadow-md transition-all duration-500`}
            title={titulo}
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-xs text-white font-semibold">
                {servidorActivo === null ? "Cargando..." : servidorActivo ? "Activo" : "Apagado"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}