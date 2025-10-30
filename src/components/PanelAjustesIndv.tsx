import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { EndpointInput } from './Endpointinput.tsx';
import { StatusCode } from './StatusCode.tsx';
import Latency from './Latency.tsx';
import { X } from 'lucide-react';



interface BaseConfig {
  enabled: boolean;
}


interface AsyncConfig extends BaseConfig {
  url: string;
  method: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  request: string;
  headers: Record<string, string>;
}


interface ChaosConfig extends BaseConfig {
  latency: number | null;
  abort: boolean;
  error: number | null;
  probability?: number | null;
}


interface EscenarioState {
  path: string;
  method: string;
  schema: string;
  status_code: number;
  headers: Record<string, string>;
  response: string;
  async: AsyncConfig;
  chaos_injection: ChaosConfig;
}

export interface PanelAjustesIndvRef {
  getEscenarioData: () => any;
  setEscenarioData: (data: Partial<EscenarioState> | null) => void;
}


export const PanelAjustesIndv = forwardRef<
  PanelAjustesIndvRef,
  { initialData?: Partial<EscenarioState>; selectedServer: string }
>(({ initialData }, ref) => {

    

    const [escenario, setEscenario] = useState<EscenarioState>({
        path: initialData?.path || '/api/v1/ruta/del/recurso',
        method: initialData?.method || 'GET',
        schema: 'schemas/request.json',
        status_code: initialData?.status_code || 200,
        headers: { 'Content-Type': 'application/json' },
        response: initialData?.response || '{"message": "success"}',
        chaos_injection: {
          enabled: false,
          latency: null,
          abort: false,
          error: null,
          probability: null,
        },
        async: {
          enabled: false,
          url: 'http://callback.example.com',
          method: 'POST',
          timeout: 5000,
          retries: 3,
          retryDelay: 1000,
          request: '{"data": "example"}',
          headers: { "Content-Type": "application/json" },
        },
      });

      //Actualizar los datos 
      useEffect(() => {
        if (initialData) {
          setEscenario((prev) => ({
            ...prev,
            path: initialData.path ?? prev.path,
            method: initialData.method ?? prev.method,
            response: initialData.response ?? prev.response,
            status_code: initialData.status_code ?? prev.status_code,
            schema: initialData.schema ?? prev.schema,
            headers: initialData.headers ?? prev.headers,
            async: {
              ...prev.async,
              ...(initialData.async || {}),
            },
            chaos_injection: {
              ...prev.chaos_injection,
              ...(initialData.chaos_injection || {}),
            },
          }));
        }
      }, [initialData]);


      
      
  const [pathError, setPathError] = useState<string | null>(null);

  const handleStateChange = (field: string, value: any) => {
    const keys = field.split('.');
    setEscenario(prevState => {

      let newState = JSON.parse(JSON.stringify(prevState));
      let current: any = newState;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newState;
    });
  };
  
  const handlePathChange = (newPath: string) => {
    handleStateChange('path', newPath);

    if (!newPath.startsWith('/')) {
      setPathError('La ruta debe comenzar con "/".');
    } else if (newPath.includes(' ')) {
      setPathError('La ruta no puede contener espacios.');
    } else if (newPath.includes('//')) {
      setPathError('La ruta no puede tener barras consecutivas.');
    } else if (!/^[a-zA-Z0-9\/:_-]*$/.test(newPath)) {
      setPathError('La ruta contiene caracteres inválidos.');
    } else {
      setPathError(null);
    }
  };


  useImperativeHandle(ref, () => ({
    getEscenarioData: () => {
      if (pathError) return null;
    
      const clean = JSON.parse(JSON.stringify(escenario));
    
      if (clean.chaos_injection) {
        if (!clean.chaos_injection.enabled) {
          delete clean.chaos_injection;
        } else {
          if (clean.chaos_injection.latency === null) delete clean.chaos_injection.latency;
          if (!clean.chaos_injection.abort) delete clean.chaos_injection.abort;
          if (clean.chaos_injection.error === null) delete clean.chaos_injection.error;
          if (
            clean.chaos_injection.probability === null ||
            clean.chaos_injection.probability === 0
          )
            delete clean.chaos_injection.probability;
        }
      }
    

      if (clean.async) {
        if (!clean.async.enabled) {
          delete clean.async;
        } else {
          clean.async.headers = Object.fromEntries(
            Object.entries(clean.async.headers || {}).filter(([k, v]) => k && v)
          );
        }
      }
    
      return clean;
    },
    
    
    setEscenarioData: (data: Partial<EscenarioState> | null) => {
      if (!data) return;

      setEscenario((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as EscenarioState;
        for (const key in data) {
          // @ts-ignore
          next[key] = (data as any)[key];
        }
        return next;
      });
    }
  }));
  
  



  return (


    <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-md border border-gray-200">
      <div className="space-y-6">

      <div className="border-gray-200 pt-4">
          <h3 className="text-md font-bold text-gray-700 mb-3">Headers</h3>
          
          <div>

          {Object.entries(escenario.async.headers).map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2 mb-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
              <input
                type="text"
                value={key.startsWith('header-') ? '' : key}
                onChange={(e) => {
                  const newKey = e.target.value || `header-${Date.now()}`;
                  const newHeaders = { ...escenario.async.headers };
                  delete newHeaders[key];
                  newHeaders[newKey] = value;
                  handleStateChange('async.headers', newHeaders);
                }}
                className="w-1/3 bg-gray-100 p-2 rounded-lg text-sm"
                placeholder="Header name"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newHeaders = { ...escenario.async.headers, [key]: e.target.value };
                  handleStateChange('async.headers', newHeaders);
                }}
                className="w-2/3 bg-gray-100 p-2 rounded-lg text-sm"
                placeholder="Header value"
              />
              <button
                onClick={() => {
                  const newHeaders = { ...escenario.async.headers };
                  delete newHeaders[key];
                  handleStateChange('async.headers', newHeaders);
                }}
                className="text-red-500 hover:text-red-700 font-bold transition-transform duration-200 hover:scale-110"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              const newHeaders = { ...escenario.async.headers, [`header-${Date.now()}`]: '' };
              handleStateChange('async.headers', newHeaders);
            }}
            className="text-sm text-blue-600 font-semibold mt-2 hover:underline transition-all duration-300 hover:text-blue-800"
          >
            + Agregar Header
          </button>
        </div>
        </div>

        

        <EndpointInput
          method={escenario.method}
          path={escenario.path}
          onMethodChange={(v) => handleStateChange('method', v)}
          onPathChange={handlePathChange}
        />
        {pathError && (<p className="text-xs text-red-600 -mt-4 ml-2">{pathError}</p>)}

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Response</label>
          <textarea 
            value={escenario.response}
            onChange={(e) => handleStateChange('response', e.target.value)}
            className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Schema</label>
          <textarea
            value={escenario.schema}
            onChange={(e) => handleStateChange('schema', e.target.value)}
            className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
            rows={3}
            placeholder='Ejemplo: {"type": "object", "properties": { "id": {"type": "number"} }}'
          />
        </div>
        
        <StatusCode
          label="Status Code"
          value={escenario.status_code}
          onChange={(v) => handleStateChange('status_code', v)}
        />
        



        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-gray-700">Chaos Injection</h3>
            <input
              type="checkbox"
              checked={escenario.chaos_injection.enabled}
              onChange={(e) => handleStateChange('chaos_injection.enabled', e.target.checked)}
              className="h-5 w-5 rounded accent-green-600"
            />
          </div>


          

            {escenario.chaos_injection.enabled && (
              <div className="pl-4 border-l-2 border-gray-200 space-y-3 pt-4">

              <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2">Request</label>
                    <textarea
                      value={escenario.async.request}
                      onChange={(e) => handleStateChange('async.request', e.target.value)}
                      className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                      rows={3}
                    />
                  </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Habilitar Latencia</label>
                  <input
                    type="checkbox"
                    checked={escenario.chaos_injection.latency !== null}
                    onChange={(e) => handleStateChange('chaos_injection.latency', e.target.checked ? 0 : null)}
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>

                {escenario.chaos_injection.latency !== null && (
                  <Latency
                    value={escenario.chaos_injection.latency}
                    onChange={(v) => handleStateChange('chaos_injection.latency', v)}
                  />
                )}

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Habilitar Abort</label>
                  <input
                    type="checkbox"
                    checked={escenario.chaos_injection.abort}
                    onChange={(e) => handleStateChange('chaos_injection.abort', e.target.checked)}
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Habilitar Error Code</label>
                  <input
                    type="checkbox"
                    checked={escenario.chaos_injection.error !== null}
                    onChange={(e) => handleStateChange('chaos_injection.error', e.target.checked ? 500 : null)}
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>

                {escenario.chaos_injection.error !== null && (
                  <div className="flex items-center gap-2 pl-4">
                    <label className="text-sm text-gray-600">Código de Error</label>
                    <input
                      type="number"
                      value={escenario.chaos_injection.error}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!Number.isNaN(value)) {
                          handleStateChange('chaos_injection.error', value);
                        }
                      }}
                      className="w-28 bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                      placeholder="e.g. 500"
                      min={100}
                      max={599}
                    />
                  </div>
                )}


        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Habilitar Probabilidad</label>
          <input
            type="checkbox"
            checked={escenario.chaos_injection.probability !== null}
            onChange={(e) =>
              handleStateChange('chaos_injection.probability', e.target.checked ? 0 : null)
            }
            className="h-5 w-5 rounded accent-green-600"
          />
        </div>


        {escenario.chaos_injection.probability !== null && (
          <div className="flex items-center gap-2 pl-4">
            <label className="text-sm text-gray-600">Probabilidad (%)</label>
            <input
              type="number"
              value={escenario.chaos_injection.probability}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 100) {
                  handleStateChange('chaos_injection.probability', value);
                }
              }}
              className="w-24 bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
              placeholder="0–100"
              min={0}
              max={100}
            />
          </div>
        )}


              </div>
            )}
        </div>



        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-gray-700">Async</h3>
            <input type="checkbox" checked={escenario.async.enabled} onChange={(e) => handleStateChange('async.enabled', e.target.checked)} className="h-5 w-5 rounded accent-green-600"/>
          </div>

          {escenario.async.enabled && (
  <div className="pl-4 border-l-2 border-gray-200 space-y-4 pt-4">

<EndpointInput
          method={escenario.method}
          path={escenario.path}
          onMethodChange={(v) => handleStateChange('method', v)}
          onPathChange={handlePathChange}
        />

    
<div>
      <label className="block text-sm font-bold text-gray-600 mb-2">Request</label>
      <textarea
        value={escenario.async.request}
        onChange={(e) => handleStateChange('async.request', e.target.value)}
        className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
        rows={3}
      />
    </div>


    <div>
      <label className="block text-sm font-bold text-gray-600 mb-2">Headers</label>

      {Object.entries(escenario.async.headers).map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2 mb-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
              <input
                type="text"
                value={key.startsWith('header-') ? '' : key}
                onChange={(e) => {
                  const newKey = e.target.value || `header-${Date.now()}`;
                  const newHeaders = { ...escenario.async.headers };
                  delete newHeaders[key];
                  newHeaders[newKey] = value;
                  handleStateChange('async.headers', newHeaders);
                }}
                className="w-1/3 bg-gray-100 p-2 rounded-lg text-sm"
                placeholder="Header name"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newHeaders = { ...escenario.async.headers, [key]: e.target.value };
                  handleStateChange('async.headers', newHeaders);
                }}
                className="w-2/3 bg-gray-100 p-2 rounded-lg text-sm"
                placeholder="Header value"
              />
              <button
                onClick={() => {
                  const newHeaders = { ...escenario.async.headers };
                  delete newHeaders[key];
                  handleStateChange('async.headers', newHeaders);
                }}
                className="text-red-500 hover:text-red-700 font-bold transition-transform duration-200 hover:scale-110"
              >
                <X />
              </button>
            </div>
          ))}


<button
  onClick={() => {
    const newHeaders = { ...escenario.async.headers };

    const uniqueKey = `header-${Date.now()}-${Object.keys(newHeaders).length}`;
    newHeaders[uniqueKey] = '';

    handleStateChange('async.headers', newHeaders);
  }}
  className="text-sm text-blue-600 font-semibold mt-2 hover:underline"
>
  + Agregar Header
</button>
      </div>
     </div>
)}
      </div>
      </div>
      </div>
  );
});
