import { useState, useRef } from "react";
import { PanelAjustesIndv } from "./PanelAjustesIndv";
import type { PanelAjustesIndvRef } from "./PanelAjustesIndv";
import { Button } from "./Button";
import { Dropdown } from "./Dropdown";
import YAML from "yaml";
import { CircleX } from 'lucide-react';
import { mapBackendToUI } from "../mapeo/mapeoDatos";

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

interface EscenarioData {
  path: string;
  method: string;
  response: string;
  status_code: number;
  headers?: Record<string, string>;
  schema?: string;
  async?: {
    enabled: boolean; 
    url: string;
    method: string;
    timeout: number;
    retries: number;
    retryDelay: number;
    request: string;
    headers: Record<string, string>;
  };
  chaos_injection?: {
    enabled: boolean; 
    latency: number | null;
    abort: boolean;
    error: number | null;
    probability?: number;
  };
}

interface Escenario {
  id: number;
  data?: EscenarioData;
}

//Función para obtener el serverConfig
const getServerConfigFromAPI = async (serverName: string) => { 
  const res = await fetch(`/api/mock/config?server_name=${serverName}`);
  if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
  return res.json();
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
  const agregarEscenario = () => {setEscenarios([...escenarios, { id: Date.now() }]);};
  const eliminarEscenario = (id: number) => {
    setEliminando(id);
    setTimeout(() => {
      setEscenarios(escenarios.filter((e) => e.id !== id));
      delete panelRefs.current[id];
      setEliminando(null);
    }, 400); 
  };

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Creamos el JSON que veremos como un archivo (por ahora)
  /*
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
  */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// Ejecutar GET al seleccionar el nombre 
const fetchServerData = async (serverName: string) => {
  try {

    const data = await getServerConfigFromAPI(serverName);
    console.log("Datos del backend:", data);

    const server = data.server_config || data?.http?.servers?.[0];
      if (server) {
        setServerConfig({
          listen: server.listen ?? defaultServerConfig.listen,
          logger: server.logger ?? defaultServerConfig.logger,
          name: server.name ?? defaultServerConfig.name,
          logger_path: server.logger_path ?? defaultServerConfig.logger_path,
          version: server.version ?? defaultServerConfig.version,
        });
      }


  const locations = data?.http?.servers?.[0]?.location;
    if (Array.isArray(locations)) {
      const nuevosEscenarios = locations.map((esc: any) => ({
        id: Date.now() + Math.random(),
        data: {
          path: esc.path || "/api/v1/recurso",
          method: esc.method || "GET",
          schema: esc.schema,
          status_code: esc.status_code || 200,
          headers: esc.headers || { "Content-Type": "application/json" },
          response: esc.response || '{"message": "success"}',
       
          async: esc.async
            ? { 
                url: "http://callback.example.com",
                method: "POST",
                timeout: 5000,
                retries: 3,
                retryDelay: 1000,
                request: '{"data": "example"}',
                headers: { "Content-Type": "application/json" },
                ...(esc.async),
                enabled: true 
              }
            : 
                undefined, //Para que no se active por default


           chaos_injection: esc.chaos_injection
             ? { 
                 latency: null,
                 abort: false,
                 error: null,
                 probability: null,
                 ...(esc.chaos_injection),
                 enabled: true
               }
             :
                undefined,
        },
      }));

      setEscenarios(nuevosEscenarios.length > 0 ? nuevosEscenarios : [{
        id: Date.now(),
        data: {
          path: "/",
          method: "GET",
          response: "{}",
          status_code: 200,
        },
      }]);
    }
  } catch (error) {

    // Reset por si falla fetch
    setServerConfig(defaultServerConfig);

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


  //Enviar Caos y Async si se activan 
  const getActiveLocations = () => {
    const escenariosActivos = escenarios
    .map(escenario => panelRefs.current[escenario.id]?.getEscenarioData?.())
      .filter((data) => data && typeof data === "object");
  
    if (escenariosActivos.length === 0) {
      console.warn("No se encontraron escenarios activos válidos.");
      return [];
    }
  
    // Validar configuración de caos y async
    escenariosActivos.forEach((escenario: any) => {
      if (escenario?.chaos_injection?.enabled) {
        const { latency, abort, error, probability } = escenario.chaos_injection;
        const tieneValores =
          latency !== null ||
          abort === true ||
          (error !== null && !isNaN(error)) ||
          (probability !== undefined && probability > 0);
  
        if (!tieneValores) {
          throw new Error(
            `El escenario "${escenario.path || "(sin path)"}" tiene el caos activado pero sin configuración válida.`
          );
        }
      }
  
      if (escenario?.async?.enabled) {
        const { url, method, timeout } = escenario.async;
        if (!url || !method || !timeout) {
          throw new Error(
            `El escenario "${escenario.path || "(sin path)"}" tiene la opción asíncrona activa pero faltan campos.`
          );
        }
      }
    });
  
    // Ordenar estructura y remover flags internos (enabled) antes de serializar
    const escenariosOrdenados = escenariosActivos.map((esc: any) => {
      const escenarioCompleto: any = { ...esc };

      // chaos_injection: eliminar si no está habilitado; si está habilitado, quitar "enabled"
      if (escenarioCompleto.chaos_injection) {
        const { enabled, ...restChaos } = escenarioCompleto.chaos_injection;
        if (enabled) {
          escenarioCompleto.chaos_injection = restChaos;
        } else {
          delete escenarioCompleto.chaos_injection;
        }
      }

      // async: eliminar si no está habilitado; si está habilitado, quitar "enabled"
      if (escenarioCompleto.async) {
        const { enabled, ...restAsync } = escenarioCompleto.async;
        if (enabled) {
          escenarioCompleto.async = restAsync;
        } else {
          delete escenarioCompleto.async;
        }
      }

      return escenarioCompleto;
    });
    return escenariosOrdenados;
  };
  
  
  
  
  



  return (
    
    <div className="p-8 space-y-6 bg-gray-100 rounded-2xl shadow-lg">
    <div className="w-full flex items-center justify-between mt-4">
        <h2 className="text-2xl font-bold text-gray-900">
        Configuración del Servidor
        </h2>

    <Button
      onClick={async () => {
        try {
          const serverName = selectedServer.trim().toLowerCase(); 
          //console.log("Servidor seleccionado:", serverName);
   
          const originalYaml = await fetch(`/api/mock/config?server_name=${serverName}`).then(res => res.text());
           //console.log("YAML original obtenido:\n", originalYaml);
 
          const doc = YAML.parseDocument(originalYaml);
 
          const locationsData = getActiveLocations();
 
          const originalServer: any = doc.getIn(["http", "servers", 0]) || {};

          // Detectar cambios en serverConfig y aplicar solo los que difieren
          const serverKeys: (keyof ServerConfig)[] = ["listen", "logger", "name", "logger_path", "version"];
          
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

          /*
          const jsOriginal = YAML.parse(originalYaml);
          const originalLocationsJS = jsOriginal?.http?.servers?.[0]?.location || [];
          for (let i = 0; i < locationsData.length; i++) {
            const loc = locationsData[i];
            const orig = originalLocationsJS[i] || {};

          // Si el location no ha cambiado, no lo tocamos
          if (JSON.stringify(orig) === JSON.stringify(loc)) continue;


          if (!doc.getIn(["http", "servers", 0, "location", i])) {
            doc.setIn(["http", "servers", 0, "location", i], {});
          }

          // headers
          if (loc.headers !== undefined && Object.keys(loc.headers).length > 0) {
            doc.setIn(["http", "servers", 0, "location", i, "headers"], loc.headers);
          }

          // method 
          if (loc.method) {
            doc.setIn(["http", "servers", 0, "location", i, "method"], loc.method);
          }

          // path 
          if (loc.path) {
            doc.setIn(["http", "servers", 0, "location", i, "path"], loc.path);
          }

          // response 
          if (loc.response) {
            doc.setIn(["http", "servers", 0, "location", i, "response"], loc.response);
          }

          // schema 
          if (loc.schema && Object.keys(loc.schema).length > 0) {
            doc.setIn(["http", "servers", 0, "location", i, "schema"], loc.schema);
          } else if (loc.schema === undefined && orig.schema) {
            //Si no cambio, pero ya existe
            doc.setIn(["http", "servers", 0, "location", i, "schema"], orig.schema);
          }

          // status_code - manejar tanto statusCode (camelCase) como status_code (snake_case)
          const statusCode = loc.statusCode !== undefined ? loc.statusCode : loc.status_code;
          if (statusCode !== undefined) {
            doc.setIn(["http", "servers", 0, "location", i, "status_code"], statusCode);
          }

          // chaos_injection 
          if (loc.chaos_injection && loc.chaos_injection.enabled) {
            doc.setIn(["http", "servers", 0, "location", i, "chaos_injection"], loc.chaos_injection);
          } else if (loc.chaos_injection === undefined && orig.chaos_injection) {
            doc.setIn(["http", "servers", 0, "location", i, "chaos_injection"], orig.chaos_injection);
          }

          // async
          if (loc.async && loc.async.enabled) {
            doc.setIn(["http", "servers", 0, "location", i, "async"], loc.async);
          } else if (loc.async === undefined && orig.async) {
            doc.setIn(["http", "servers", 0, "location", i, "async"], orig.async);
          }
        }

        // Si se eliminaron en ajustes, se limpian
        const originalLocationNode = doc.getIn(["http", "servers", 0, "location"]) as unknown;
        const originalLength = Array.isArray(originalLocationNode) ? originalLocationNode.length : 0;
        if (originalLength > locationsData.length) {
          for (let j = originalLength - 1; j >= locationsData.length; j--) {
            doc.deleteIn(["http", "servers", 0, "location", j]);
          }
        }
        */
          
          doc.setIn(["http", "servers", 0, "location"], locationsData);

          const jsonData = doc.toJS(); 

          const response = await fetch(`/api/mock/config?server_name=${serverName}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonData), //Enviamos como JSON
          });

          if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

          alert("Configuración del servidor actualizada correctamente");
          
          await refreshDataAfterSave(serverName);
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
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
    <div className="flex justify-between items-center mb-4">


      <Dropdown 
      options={[
        //
        { label: "Example", value: "Mockingbird" }, //Ejemplo
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
          setServerConfig(defaultServerConfig);
        }
        }}
      />



    {/*Config del servidor */}
    </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-bold text-gray-600">Name</label>
            <input type="text" value={serverConfig.name} onChange={(e) => handleServerConfigChange('name', e.target.value)} className="w-full mt-1 bg-gray-200/60 p-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600">Listen</label>
            <input type="text" 
            value={serverConfig.listen} 
            onChange={(e) => {
              const value = e.target.value;
              const numericValue = Number(value);
        
   
              if (!isNaN(numericValue)) {
                handleServerConfigChange('listen', numericValue.toString()); 
              } else if (value === '') {
                handleServerConfigChange('listen', '');
              }
            }}
             className="w-full mt-1 bg-gray-200/60 p-2 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
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

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
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

          <Button
            onClick={() => eliminarEscenario(escenario.id)}
            variant={"ghost"}
            className="eliminate-btn absolute top-3 right-3 w-10 h-10 flex items-center justify-center text-red-500 hover:text-red-700 font-bold text-lg rounded-full hover:bg-red-50 transition-all duration-200"
            title="Eliminar endpoint"
          >
          <CircleX /> 
          </Button>

          <PanelAjustesIndv
            ref={(ref) => {
              panelRefs.current[escenario.id] = ref;
            }}
            initialData={escenario.data ? mapBackendToUI(escenario.data) : undefined} 
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

