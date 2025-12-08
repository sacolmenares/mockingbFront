import { useEffect, useState } from "react";
import logo from "../assets/logo2.svg";

export function PageHeader() {
  const [servidorActivo, setServidorActivo] = useState<boolean | null>(null);


  
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
    <div className="flex items-center justify-between p-2 border-b border-gray-200 shadow-md z-10 bg-white">
      <div className="flex items-center gap-2">
      <img src={logo} className="h-[90px] w-[90px] object-contain" alt="Logo" />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 font-medium italic">
          Estado del servidor
        </span>

        
        <div
          className={`w-28 h-8 rounded-full bg-gradient-to-r ${gradiente} shadow-md transition-all duration-500`}
          title={titulo}
        >
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-white font-semibold">
              {servidorActivo === null
                ? "Cargando..."
                : servidorActivo
                ? "Activo"
                : "Apagado"}
            </span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
