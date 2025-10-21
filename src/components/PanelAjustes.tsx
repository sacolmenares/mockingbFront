import { useState, useRef } from "react";
import { PanelAjustesIndv } from "./PanelAjustesIndv";
import type { PanelAjustesIndvRef } from "./PanelAjustesIndv";
import { Button } from "./Button";

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
  
  const [escenarios, setEscenarios] = useState([{ id: Date.now() }]);
  const panelRefs = useRef<{ [key: number]: PanelAjustesIndvRef | null }>({});
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [reseteando, setReseteando] = useState(false);


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
    const fileContent = JSON.stringify(finalConfig, null, 2);
    const blob = new Blob([fileContent], { type: 'application/json' }); 
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `configuracion_mockingbird.json`; //Nombre del archivo JSON que se genera
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

  return (
    <div className="p-8 space-y-6 bg-gray-100 rounded-2xl shadow-lg">
      return (
    <div className="p-8 space-y-6 bg-gray-100 rounded-2xl shadow-lg">
      

    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuración del Servidor</h2>
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

