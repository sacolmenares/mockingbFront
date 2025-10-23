import { useState, useRef } from "react";
import { PanelAjustesIndv } from "./PanelAjustesIndv";
import type { PanelAjustesIndvRef } from "./PanelAjustesIndv";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";

interface PanelAjustesProps {
  onAjustesAplicados: (count: number) => void;
}


interface ServerConfig {
  listen: string;
  logger: string;
  name: string;
  logger_path: string;
  version: string;
}

interface EscenarioData {
    endpoint: string;
    method: string;
    responseBody: string;
    statusCode: number;
  }
  
  interface Escenario {
    id: number;
    data?: EscenarioData; // opcional porque a veces puede estar vacío
  }
  

export function PanelAjustes({ onAjustesAplicados }: PanelAjustesProps) {


  //Valores por defecto
  const [serverConfig, setServerConfig] = useState<ServerConfig>({
    listen: '0.0.0.0:8080',
    logger: 'default',
    name: 'mockingbird-server',
    logger_path: '/var/log/mockingbird.log',
    version: '1.0.0',
  });

  const handleServerConfigChange = (field: keyof ServerConfig, value: string) => {
    setServerConfig(prevState => ({ ...prevState, [field]: value }));
  };
  
  const [escenarios, setEscenarios] = useState<Escenario[]>([{ id: Date.now() }]);
  const panelRefs = useRef<{ [key: number]: PanelAjustesIndvRef | null }>({});
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [reseteando, setReseteando] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('Mockingbird');
  const [backendEscenarios, setBackendEscenarios] = useState<any[]>([]);










  const agregarEscenario = () => {
    setEscenarios([...escenarios, { id: Date.now() }]);
  };


  const eliminarEscenario = (id: number) => {
    setEliminando(id);
    setTimeout(() => {
      setEscenarios(escenarios.filter((e) => e.id !== id));
      delete panelRefs.current[id];
      setEliminando(null);
    }, 400); 
  };


  //Creamos el JSON que veremos como un archivo (por ahora)
  const aplicarTodosLosEscenarios = () => {
    let hasErrors = false;
    

    const locationsData = escenarios.map(escenario => {
      const panelRef = panelRefs.current[escenario.id];
      if (panelRef) {
        const data = panelRef.getEscenarioData();
        if (data === null) hasErrors = true;
        return data;
      }
      return null;
    }).filter(Boolean); 

    if (hasErrors) {
      alert("No se pueden guardar: Hay errores en las rutas de algunos escenarios.");
      return; 
    }


    const finalConfig = {
      http: {
        servers: [
          {
            ...serverConfig,      
            location: locationsData,  
          }
        ]
      }
    };
    

    console.log("GENERANDO CONFIGURACIÓN FINAL:", JSON.stringify(finalConfig, null, 2));
    //Aqui lo convertimos en texto para leer el archivo
    const fileContent = JSON.stringify(finalConfig, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `configuracion_mockingbird.json`; //Nombre del archivo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    

    onAjustesAplicados(locationsData.length);
    setReseteando(true);
      setTimeout(() => {
        setEscenarios([{ id: Date.now() }]); 
        panelRefs.current = {}; 
        setReseteando(false); 
      }, 3000);
  };



// Ejecutar GET al seleccionar el nombre 
const fetchServerData = async (serverName: string) => {
  try {
    const response = await fetch(`/api/mock/config?server_name=${serverName}`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }


    const data = await response.json();


    if (Array.isArray(data.scenarios)) {
      setBackendEscenarios(data.scenarios);
    
      const nuevosEscenarios = data.scenarios.map((esc: any) => ({
        id: Date.now() + Math.random(),
        data: {
          endpoint: esc.request_endpoint,
          method: esc.request_method,
          responseBody: esc.response_body,
          statusCode: esc.response_status_code,
        },
      }));
    

      setEscenarios(nuevosEscenarios.length > 0 ? nuevosEscenarios : [{ id: Date.now() }]);
    }

    if (data.server_config) {
      const server = data.server_config;
      setServerConfig({
        listen: server.listen || "",
        logger: server.logger || "",
        name: server.name || "",
        logger_path: server.logger_path || "",
        version: server.version || "",
      });
    } else {
      setServerConfig({
        listen: "0.0.0.0:3231",
        logger: "default",
        name: "mockingbird-server",
        logger_path: "/var/log/mockingbird.log",
        version: "1.0.0",
      });
    }

  } catch (error) {
    console.error("Error al obtener datos del servidor:", error);
    // Si falla el fetch, resetea todo
    setEscenarios([{ id: Date.now() }]);
    setServerConfig({
      listen: "0.0.0.0:8080",
      logger: "default",
      name: "mockingbird-server",
      logger_path: "/var/log/mockingbird.log",
      version: "1.0.0",
    });
  }
};
  


  return (
    <div className="p-8 space-y-6 bg-gray-100 rounded-2xl shadow-lg">
    <div className="p-8 space-y-6 bg-gray-100 rounded-2xl shadow-lg">
      

    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-gray-900">Configuración del Servidor</h2>


      <Dropdown 
  options={[
    { label: "Mockingbird (local)", value: "Mockingbird" },
    { label: "Bancrecer", value: "Bancrecer" },
    { label: "Sample", value: "Sample" },
    { label: "CTS", value: "CTS" },
  ]}
  value={selectedServer}
  onChange={(val) => {
    setSelectedServer(val);
  
    const endpoints: Record<string, string> = {
      Bancrecer: "bancrecer",
      Sample: "sample",
      CTS: "cts",
    };
  
    if (endpoints[val]) {
      fetchServerData(endpoints[val]);
    } else {
      setServerConfig({
        listen: "0.0.0.0:8080",
        logger: "default",
        name: "mockingbird-server",
        logger_path: "/var/log/mockingbird.log",
        version: "1.0.0",
      });
    }
  }}
/>


<button   //Aquí se realiza el put al presionar "Guardar Cambios"
      onClick={async () => {
        try {
          const serverName = selectedServer.trim().toLowerCase();
          const response = await fetch(`/api/mock/config?server_name=${serverName}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ http: { servers: [serverConfig] } }),
          });

          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

          const result = await response.json();
          console.log("Cambios guardados en el servidor:", result);
          alert("Configuración del servidor actualizada correctamente ✅");
        } catch (error) {
          console.error("Error al actualizar configuración:", error);
          alert("❌ Error al guardar la configuración del servidor.");
        }
      }}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
    >
      Guardar cambios
    </button>


    </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-600">Name</label>
            <input type="text" value={serverConfig.name} onChange={(e) => handleServerConfigChange('name', e.target.value)} className="w-full mt-1 bg-gray-200/60 p-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600">Listen</label>
            <input type="text" value={serverConfig.listen} onChange={(e) => handleServerConfigChange('listen', e.target.value)} className="w-full mt-1 bg-gray-200/60 p-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600">Version</label>
            <input type="text" value={serverConfig.version} onChange={(e) => handleServerConfigChange('version', e.target.value)} className="w-full mt-1 bg-gray-200/60 p-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-gray-600">Logger Path</label>
            <input type="text" value={serverConfig.logger_path} onChange={(e) => handleServerConfigChange('logger_path', e.target.value)} className="w-full mt-1 bg-gray-200/60 p-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
           <div>
            <label className="text-sm font-bold text-gray-600">Logger</label>
            <input type="text" value={serverConfig.logger} onChange={(e) => handleServerConfigChange('logger', e.target.value)} className="w-full mt-1 bg-gray-200/60 p-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>
      </div>
      </div>


      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Ajustar escenarios
        </h1>
        
        <div className="pt-6 flex justify-end">
            <Button
                variant="ghost"
                className={`px-6 py-2 border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white transition-all duration-200 ${
                  reseteando ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={aplicarTodosLosEscenarios}
                disabled={reseteando}>
                {reseteando ? 'RESETEANDO...' : 'APLICAR TODOS'}
            </Button>
        </div>

      </div>

      {reseteando && (
        <div className="flex justify-center items-center py-8 animate-fadeInSimple">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div> 
          <span className="ml-3 text-gray-600 font-medium">Aplicando ajustes...</span>
        </div>
        </div>
      )}
      
      {!reseteando && escenarios.map((escenario, index) => (
        <div
          key={escenario.id}
          className={`panel-container relative border border-gray-300 rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 ${
            eliminando === escenario.id 
              ? 'animate-slideOut' 
              : 'animate-slideIn'
          }`}
          style={{ 
            animationDelay: eliminando === escenario.id ? '0ms' : `${index * 150}ms`,
            overflow: eliminando === escenario.id ? 'hidden' : 'visible'
          }}
        >
          <button
            onClick={() => eliminarEscenario(escenario.id)}
            className="eliminate-btn absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-700 font-bold text-lg rounded-full hover:bg-red-50 transition-all duration-200"
            title="Eliminar este escenario"
          >
            ✕ 
          </button>

          <PanelAjustesIndv
  ref={(ref) => {
    panelRefs.current[escenario.id] = ref;
  }}
  initialData={escenario.data} 
  selectedServer={selectedServer}
/>

        </div>
      ))}

       <div className="pt-6 flex justify-start">
         <Button
           variant="ghost"
           className="px-6 py-2 border border-green-600 text-green-600 bg-transparent hover:bg-green-600 hover:text-white w-auto"
           onClick={agregarEscenario}
         >
           + Agregar escenario
         </Button>
       </div>
    </div>
  );
}


// Animacion al aparecer el panel
const style = document.createElement("style");
style.innerHTML = `
@keyframes fadeInSimple {
  from { 
    opacity: 0; 
  }
  to { 
    opacity: 1; 
  }
}

.animate-fadeInSimple {
  animation: fadeInSimple 0.5s ease-out forwards;
}

@keyframes fadeInUp {
  0% { 
    opacity: 0; 
    transform: translateY(30px) scale(0.96); 
    filter: blur(4px);
  }
  60% {
    opacity: 0.8;
    transform: translateY(-5px) scale(0.99);
    filter: blur(1px);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
    filter: blur(0);
  }
}

@keyframes fadeOutDown {
  0% { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
    filter: blur(0);
  }
  30% {
    opacity: 0.7;
    transform: translateY(5px) scale(0.99);
    filter: blur(0.5px);
  }
  100% { 
    opacity: 0; 
    transform: translateY(30px) scale(0.96); 
    filter: blur(4px);
  }
}

.animate-slideIn {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-slideOut {
  animation: fadeOutDown 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards;
}

/* Efecto de hover sutil para el botón de eliminar */
.eliminate-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: scale(1);
}

.eliminate-btn:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3));
}

/* Transición suave para el contenedor */
.panel-container {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
`;
document.head.appendChild(style);

