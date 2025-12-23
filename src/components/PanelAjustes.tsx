import { useState, useRef, useEffect } from "react";
import { PanelAjustesIndv } from "./PanelAjustesIndv";
import type { PanelAjustesIndvRef } from "./PanelAjustesIndv";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import YAML from "yaml";
import { CircleX, Plus } from 'lucide-react';
import { mapBackendToUI } from "../mapeo/mapeoDatos";
import type { EscenarioUI } from "../types/escenarioUI";
import { Card } from "../components/Card"

function wrapBackendStructure(server: ServerConfig, postgresServers: ServerConfig[] = []) {
  return {
    http: {
      servers: [server]
    },
    postgres: {
      servers: postgresServers
    }
  };
}

const defaultServerConfig: ServerConfig = {
  listen: 8080,
  logger: "default",
  name: "Example-server",
  logger_path: "/var/log/Example.log",
  version: "2.0.0",
};

interface PanelAjustesProps {
  onAjustesAplicados: (count: number) => void;
}

interface ServerConfig {
  listen: number;
  logger: string;
  name: string;
  logger_path: string;
  version: string;
}

interface Escenario {
  id: number;
  data?: EscenarioUI;
}

interface ServerOption {
  label: string;
  value: string;
}

const getServerConfigFromAPI = async (serverName: string) => { 
  const res = await fetch(`/api/mock/config?server_name=${serverName}`);
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
  return res.json();
};

// Lista por defecto de servidores
const defaultServerList: ServerOption[] = [
  { label: "Example", value: "Mockingbird" },
  { label: "Bancrecer", value: "Bancrecer" },
  { label: "Sample", value: "Sample" },
  { label: "CTS", value: "CTS" },
];

// Función para obtener la lista de servidores disponibles desde el backend
// Nuevo endpoint: /api/mock/config/servers (lee los archivos de config/)
const getAvailableServers = async (currentList?: ServerOption[]): Promise<ServerOption[]> => {
  try {
    // Intentar obtener lista de servidores desde el backend
    const res = await fetch('/api/mock/config/servers');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((s: string) => ({ label: s, value: s.toLowerCase() }));
      }
      if (data.servers && Array.isArray(data.servers)) {
        return data.servers.map((s: string) => ({ label: s, value: s.toLowerCase() }));
      }
    }
  } catch (error) {
    if (error instanceof Error && !error.message.includes('408')) {
      console.log("No se pudo obtener lista de servidores del backend:", error);
    }
  }
  return currentList && currentList.length > 0 ? currentList : defaultServerList;
};


export function PanelAjustes({ onAjustesAplicados: _onAjustesAplicados }: PanelAjustesProps) {
  const [serverConfig, setServerConfig] = useState<ServerConfig>(defaultServerConfig);

  const handleServerConfigChange = (field: keyof ServerConfig, value: string | number) => {
    setServerConfig(prevState => {
        const newValue = field === 'listen' ? Number(value) : value;
        return ({ ...prevState, [field]: newValue as any }); 
    });
};
  
  const [escenarios, setEscenarios] = useState<Escenario[]>([{ id: Date.now() }]);
  const panelRefs = useRef<{ [key: number]: PanelAjustesIndvRef | null }>({});
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [reseteando, _setReseteando] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string>('Mockingbird');
  const [serverOptions, setServerOptions] = useState<ServerOption[]>([
    { label: "Example", value: "Mockingbird" },
    { label: "Bancrecer", value: "Bancrecer" },
    { label: "Sample", value: "Sample" },
    { label: "CTS", value: "CTS" },
  ]);
  const [showAddServerModal, setShowAddServerModal] = useState(false);
  const [newServerName, setNewServerName] = useState('');
  const agregarEscenario = () => {setEscenarios([...escenarios, { id: Date.now() }]);};
  const eliminarEscenario = (id: number) => {
    setEliminando(id);
    setTimeout(() => {
      setEscenarios(escenarios.filter((e) => e.id !== id));
      delete panelRefs.current[id];
      setEliminando(null);
    }, 400); 
  };


// Ejecutar GET al seleccionar el nombre 
const fetchServerData = async (serverName: string) => {
  try {
    const data = await getServerConfigFromAPI(serverName);
    console.log("Datos que vienen del backend:", data);
    const server: any = data.server_config || data?.http?.servers?.[0];
      if (server) {
        setServerConfig({
          listen: server.listen ?? defaultServerConfig.listen,
          logger: server.logger ?? defaultServerConfig.logger,
          name: server.name ?? defaultServerConfig.name,
          logger_path: server.logger_path ?? defaultServerConfig.logger_path,
          version: server.version ?? defaultServerConfig.version,
        });
      } else {
        setServerConfig({
          ...defaultServerConfig,
          name: serverName.charAt(0).toUpperCase() + serverName.slice(1),
        });
      }

    const locations = data?.http?.servers?.[0]?.location;
      if (Array.isArray(locations) && locations.length > 0) {
        const nuevosEscenarios = locations.map((esc: any) => ({
          id: Date.now() + Math.random(),
          data: mapBackendToUI(esc),
          }));
        setEscenarios(nuevosEscenarios); 
      } else {
        setEscenarios([{ id: Date.now() }]);
      }
    } catch (error) {
      console.log("Error al cargar servidor, usando configuración por defecto:", error);
      setServerConfig({
        ...defaultServerConfig,
        name: serverName.charAt(0).toUpperCase() + serverName.slice(1),
      });
      setEscenarios([{ id: Date.now() }]);
    }
};


const refreshDataAfterSave = (serverName: string) =>
  new Promise<void>((resolve) => {
    setTimeout(async () => {
      await fetchServerData(serverName);
      resolve();
    }, 500);
  });


useEffect(() => {
  const loadServers = async () => {
    const servers = await getAvailableServers(defaultServerList);
    setServerOptions(servers);
    if (servers.length > 0 && !servers.find(s => s.value === selectedServer)) {
      setSelectedServer(servers[0].value);
      const endpoints: Record<string, string> = {
        Bancrecer: "bancrecer",
        Sample: "sample",
        CTS: "cts",
      };
      const serverName = endpoints[servers[0].value] || servers[0].value.toLowerCase();
      await fetchServerData(serverName);
    }
  };
  loadServers();
}, []);


// Crear nuevo servidor 
interface LocationConfig {
  method: string;
  path: string;
  headers: Record<string, string>;
  response: string;
  status_code: number;
}

interface ServerConfig {
  listen: number;
  logger: string;
  name: string;
  logger_path: string;
  version: string;
  location?: LocationConfig[];
}

const handleCreateServer = async () => {
  try {
    const validName = newServerName.trim();
    if (!validName) throw new Error("Debes ingresar un nombre de servidor");

    // Payload para crear el servidor
    const payloadPost = {
      http: {
        servers: [
          {
            name: validName,
            version: "0.0.1",
            logger: true,
            logger_path: `./log/${validName.toLowerCase()}`,
          }
        ]
      }
    };

   
    const postResponse = await fetch(`/api/mock/config?server_name=${validName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadPost),
    });

    if (!postResponse.ok) throw new Error(`Error al crear servidor (POST ${postResponse.status})`);

    const payloadPut = {
      http: {
        servers: [
          {
            listen: 1111
          }
        ]
      }
    };

    const putResponse = await fetch(`/api/mock/config?server_name=${validName}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadPut),
    });

    if (!putResponse.ok) throw new Error(`Error al actualizar servidor (PUT ${putResponse.status})`);

    alert(`Servidor "${validName}" creado y configurado correctamente`);

    await refreshDataAfterSave(validName);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Error al crear el servidor.";
    alert(errorMessage);
  }
};


const getActiveLocations = () => {
    const escenariosActivos = escenarios
      .map(escenario => {
        const ref = panelRefs.current[escenario.id];
        if (!ref) {
          console.warn(`Ref no encontrado para escenario ${escenario.id}`);
          return null;
        }
        const data = ref.getEscenarioData?.();
        if (!data || typeof data !== "object") {
          console.warn(`Datos inválidos para escenario ${escenario.id}:`, data);
          return null;
        }
        return data;
      })
      .filter((data): data is any => data !== null && typeof data === "object");
  
    if (escenariosActivos.length === 0) {
      console.warn("No se encontraron escenarios activos válidos.");
      return [];
    }
  
    escenariosActivos.forEach((escenario: any) => {
      if (escenario?.chaos_injection) {
        const chaos = escenario.chaos_injection;
        const tieneValores =
          (chaos.latency?.time !== undefined && chaos.latency.time > 0) ||
          (chaos.abort?.code !== undefined && chaos.abort.code > 0) ||
          (chaos.error?.code !== undefined && chaos.error.code > 0);

        if (!tieneValores) {
          throw new Error(
            `El escenario "${escenario.path || "(sin path)"}" tiene el caos activado pero sin configuración válida.`
          );
        }
      }

      if (escenario?.async) {
        const { url, method } = escenario.async;
      
        if (!url || !method) {
          throw new Error(
            `El escenario "${escenario.path || "(sin path)"}" tiene la opción asíncrona activa pero faltan URL o Method.`
          );
        }
      }
    });
  
    const escenariosOrdenados = escenariosActivos.map((esc: any) => {
      const escenarioCompleto: any = { ...esc };

      if (escenarioCompleto.async) {
        escenarioCompleto.async = {
          ...escenarioCompleto.async,
          body: escenarioCompleto.async.body ?? ""
        };
      }
      
      return escenarioCompleto;
    });
    
    console.log("Escenarios procesados para guardar:", escenariosOrdenados);
    return escenariosOrdenados;
  };
  
  
  
  
  



  return (     
  <div className="p-8 space-y-6"> 
    <Card title="">
    <div className="w-full flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold dark:text-white">
        Configuración del Servidor
        </h2>

    <Button
      onClick={async () => {
        try {
          const serverName = selectedServer.trim().toLowerCase(); 

          const originalYaml = await fetch(`/api/mock/config?server_name=${serverName}`).then(res => res.text());
           console.log("YAML original obtenido:\n", originalYaml);
 
          const doc = YAML.parseDocument(originalYaml);

          const locationsData = getActiveLocations();

          const originalServer: any = doc.getIn(["http", "servers", 0]) || {};
          const originalLocationsRaw = doc.getIn(["http", "servers", 0, "location"]);
          const originalLocations: any[] = Array.isArray(originalLocationsRaw) ? originalLocationsRaw : [];

          const serverKeys: (keyof ServerConfig)[] = ["listen", "logger", "name", "logger_path", "version"];
          console.log("locationsData ANTES DE YAML:\n", JSON.stringify(locationsData, null, 2));
          console.log("originalLocations:\n", JSON.stringify(originalLocations, null, 2));

          
          const hasServerChanges = serverKeys.some((k) => (originalServer?.[k] ?? null) !== serverConfig[k]);
          if (hasServerChanges) {
            for (const key of serverKeys) {
              const prevVal: string | null = originalServer?.[key] ?? null;
              const nextVal = serverConfig[key];
              if (prevVal !== nextVal) {
                doc.setIn(["http", "servers", 0, key], nextVal);
              }
            }
          }
          
          if (locationsData && locationsData.length > 0) {
            const locationsChanged = JSON.stringify(originalLocations) !== JSON.stringify(locationsData);
            if (locationsChanged) {
              doc.setIn(["http", "servers", 0, "location"], locationsData);
            }
          } else if (locationsData.length === 0 && originalLocations.length > 0) {
            console.warn("No se encontraron locations activas, manteniendo las originales");
          } else {
            doc.setIn(["http", "servers", 0, "location"], locationsData);
          }
          const jsonData = doc.getIn(["http", "servers", 0]);
          const payload = wrapBackendStructure(jsonData as ServerConfig);
          

          const response = await fetch(`/api/mock/config?server_name=${serverName}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          console.log("JSON enviado al back", JSON.stringify(payload, null, 2))

          if (!response.ok)
            throw new Error(`Error HTTP: ${response.status}`);
          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
          alert("Configuración del servidor actualizada correctamente");
          await refreshDataAfterSave(serverName);
          
          const updatedServers = await getAvailableServers(serverOptions);
          setServerOptions(updatedServers);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error al guardar la configuración del servidor.";
          alert(errorMessage);
        }
      }}
      variant="ghost"
      gradientColors="from-blue-500 via-blue-600 to-blue-700"
    >
      Guardar cambios
    </Button>
    </div> 
    </Card>
    {/**
    </div><div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"> 
    */}
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-3">
        <Dropdown 
          options={serverOptions}
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
              fetchServerData(val.toLowerCase());
            }
          }}
        />
        
        <Button
          onClick={() => setShowAddServerModal(true)}
          variant="ghost"
          gradientColors="from-green-500 via-green-600 to-green-700"
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Agregar servidor
        </Button>
      </div>

    </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Name</label>
            <input type="text" value={serverConfig.name} onChange={(e) => handleServerConfigChange('name', e.target.value)} className="w-full mt-1 bg-gray-200/60 dark:bg-gray-700/60 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"/>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Listen</label>
            <input type="text" 
            value={serverConfig.listen > 0 ? serverConfig.listen : ''}
            onChange={(e) => {
              const value = e.target.value.trim();
              if (value === ''){
                handleServerConfigChange('listen',defaultServerConfig.listen);
              } else {
                const numericValue = Number(value);
                if (!isNaN(numericValue)&& numericValue > 0) {
                  handleServerConfigChange('listen', numericValue);
                }
              }
            }}
             className="w-full mt-1 bg-gray-200/60 dark:bg-gray-700/60 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"/>
          </div>
          
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Version</label>
            <input 
              type="text" 
              value={serverConfig.version} 
              onChange={(e) => {
                const value = e.target.value.trim();
                  if (value === '') {
                  handleServerConfigChange('version', defaultServerConfig.version);
                } else {
                  handleServerConfigChange('version', value);
                }
              }} 
              className="w-full mt-1 bg-gray-200/60 dark:bg-gray-700/60 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
            />
          </div>  
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Logger Path</label>
            <input type="text" value={serverConfig.logger_path} onChange={(e) => handleServerConfigChange('logger_path', e.target.value)} className="w-full mt-1 bg-gray-200/60 dark:bg-gray-700/60 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"/>
          </div>
           <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-300">Logger</label>
            <input type="text" value={serverConfig.logger} onChange={(e) => handleServerConfigChange('logger', e.target.value)} className="w-full mt-1 bg-gray-200/60 dark:bg-gray-700/60 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"/>
          </div>
        </div>
 

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de endpoints
        </h1>
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
          className={`panel-container relative border border-gray-300 dark:border-gray-700 rounded-2xl p-6 bg-gray-50 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 ${
            eliminando === escenario.id 
              ? 'animate-slideOut' 
              : 'animate-slideIn'
          }`}
          style={{ 
            animationDelay: eliminando === escenario.id ? '0ms' : `${index * 150}ms`,
            overflow: eliminando === escenario.id ? 'hidden' : 'visible'
          }}
        >

      <Button
        onClick={() => eliminarEscenario(escenario.id)}
        variant={"ghost"}
        className="eliminate-btn absolute top-3 right-3 w-10 h-10 flex items-center justify-center font-bold text-lg rounded-full hover:bg-red-50 transition-all duration-200"
        title="Eliminar endpoint"
      >
        <CircleX style={{ color: '#B91C1C' }} /> 
      </Button>

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
           gradientColors="from-green-500 via-green-600 to-green-700"
           onClick={agregarEscenario}
         >
           + Agregar escenario
         </Button>
       </div>

      {showAddServerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Agregar Nuevo Servidor
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">
                Nombre del Servidor
              </label>
              <input
                type="text"
                value={newServerName}
                onChange={(e) => setNewServerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateServer();
                  }
                  if (e.key === 'Escape') {
                    setShowAddServerModal(false);
                    setNewServerName('');
                  }
                }}
                placeholder="Ingrese el nombre del servidor"
                className="w-full bg-gray-200/60 dark:bg-gray-700/60 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => {
                  setShowAddServerModal(false);
                  setNewServerName('');
                }}
                variant="ghost"
                gradientColors="from-gray-400 via-gray-500 to-gray-600"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateServer}
                variant="ghost"
                gradientColors="from-green-500 via-green-600 to-green-700"
              >
                Crear Servidor
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Animaciones al aparecer el panel
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