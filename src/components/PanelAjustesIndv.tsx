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
  latencyProbability?: number | string | null;
  abort: boolean | null;
  abortProbability?: number | string | null;
  error: number | string | null;
  errorProbability?: number | string | null;
}


interface EscenarioState {
  path: string;
  method: string;
  schema: string | undefined | null;
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
        schema: initialData?.schema ?? null,
        status_code: initialData?.status_code || 200,
        headers: { 'Content-Type': 'application/json' },
        response: initialData?.response || '{"message": "success"}',
        chaos_injection: {
          enabled: false,
          latency: null,
          abort: null,
          abortProbability: null,
          error: null,
          errorProbability: null,
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
        if (!initialData) return;
      
        setEscenario((prev) => {
          const next = { ...prev };
      
          // Datos base
          next.path = initialData.path ?? prev.path;
          next.method = initialData.method ?? prev.method;
          next.response = initialData.response ?? prev.response;
          next.status_code = initialData.status_code ?? prev.status_code;
          next.schema = initialData.schema ?? prev.schema;
          next.headers = initialData.headers ?? prev.headers;
      
          //Activa async si existe en el YAML (aun no funciona bien)
          if (initialData.async) {
            next.async = {
              ...prev.async,
              ...initialData.async,
            };
          } else {
            next.async = { ...prev.async, enabled: false };
          }
    
          if (initialData.chaos_injection) {
            const chaos = initialData.chaos_injection;
            const hasAnyChaos =
              chaos.latency !== undefined ||
              chaos.abort !== undefined ||
              chaos.error !== undefined ||
              chaos.latencyProbability !== undefined ||
              chaos.abortProbability !== undefined ||
              chaos.errorProbability !== undefined;

            next.chaos_injection = {
              enabled: hasAnyChaos, 
              
              latency:
                typeof chaos.latency === "number" ? chaos.latency : null,
              latencyProbability:
                typeof chaos.latencyProbability === "number" ||
                typeof chaos.latencyProbability === "string"
                  ? chaos.latencyProbability
                  : null,

              abort:
                chaos.abort === true || typeof chaos.abort === "number"
                  ? chaos.abort
                  : null,
              abortProbability:
                typeof chaos.abortProbability === "number" ||
                typeof chaos.abortProbability === "string"
                  ? chaos.abortProbability
                  : null,

              error:
                typeof chaos.error === "number" || typeof chaos.error === "string"
                  ? chaos.error
                  : null,
              errorProbability:
                typeof chaos.errorProbability === "number" ||
                typeof chaos.errorProbability === "string"
                  ? chaos.errorProbability
                  : null,
            };
          } else {
            next.chaos_injection = {
              ...prev.chaos_injection,
              enabled: false,
              latency: null,
              latencyProbability: null,
              abort: null,
              abortProbability: null,
              error: null,
              errorProbability: null,
            };
          }
          return next;
        });
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
    
      const data: any = {
        method: clean.method,
        path: clean.path,
        headers: clean.headers,
        response: clean.response,
        status_code: clean.status_code,
      };
    
      if (clean.schema !== null && clean.schema !== undefined) {
        data.schema = clean.schema;
      }
    
      // --- Solo agregar ASYNC si está habilitado ---
      if (clean.async?.enabled) {
        data.async = {
          method: clean.async.method,
          url: clean.async.url,
          body: clean.async.request,
          headers: Object.fromEntries(
            Object.entries(clean.async.headers || {}).filter(([k, v]) => k && v)
          ),
          timeout: clean.async.timeout,
          retries: clean.async.retries,
          retryDelay: clean.async.retryDelay,
        };
      }
    
      //Solo se agrega caos si existe en el YAML (aun no funciona bien)
      if (clean.chaos_injection?.enabled) {
        data.chaos_injection = {};
    
        if (typeof clean.chaos_injection.latency === "number")
          data.chaos_injection.latency = clean.chaos_injection.latency;
    
        if (clean.chaos_injection.latencyProbability)
          data.chaos_injection.latencyProbability = clean.chaos_injection.latencyProbability;
    
        if (clean.chaos_injection.abort !== null && clean.chaos_injection.abort !== undefined)
          data.chaos_injection.abort = clean.chaos_injection.abort;
    
        if (clean.chaos_injection.abortProbability)
          data.chaos_injection.abortProbability = clean.chaos_injection.abortProbability;
    
        if (clean.chaos_injection.error !== null && clean.chaos_injection.error !== undefined)
          data.chaos_injection.error = clean.chaos_injection.error;
    
        if (clean.chaos_injection.errorProbability)
          data.chaos_injection.errorProbability = clean.chaos_injection.errorProbability;
      }
    
      return data;
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
                <X />
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
            rows={5}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Schema</label>
          <textarea
            value={escenario.schema ?? ''}
            onChange={(e) => handleStateChange('schema', e.target.value)}
            className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
            rows={5}
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
                  <div className="flex flex-col items-center gap-2 pl-4">
                    <div className="w-full">
                  <Latency
                    value={escenario.chaos_injection.latency}
                    onChange={(v) => handleStateChange('chaos_injection.latency', v)}
                  />
                  </div>
                  <div className="w-full">
                  <label className="text-sm text-gray-600">Probabilidad (%)</label>
                  <input
                    type="number"
                    value={escenario.chaos_injection.latencyProbability ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d*$/.test(value) && Number(value) >= 0 && Number(value) <= 100)) {
                        handleStateChange('chaos_injection.latencyProbability', value);
                      }
                    }}
                    onBlur={() => {
                      const numValue = Number(escenario.chaos_injection.latencyProbability);
                      if (!Number.isNaN(numValue)) {
                        handleStateChange('chaos_injection.latencyProbability', numValue);
                      }
                    }}
                    className="w-28 bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                    placeholder="0-100"
                  />
                  </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Habilitar Abort</label>
                  <input
                    type="checkbox"
                    checked={escenario.chaos_injection.abort !== null}
                    onChange={(e) => handleStateChange('chaos_injection.abort', e.target.checked ? true : null)}
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>
                {escenario.chaos_injection.abort == true && (
                <div className="flex flex-col items-center gap-2 pl-4">
                  <div className="w-full">
                    <label className="text-sm text-gray-600">Código</label>
                    <input
                      type="number"
                      value={
                        typeof escenario.chaos_injection.abort === 'number' ||
                        typeof escenario.chaos_injection.abort === 'string'
                          ? escenario.chaos_injection.abort
                          : ''
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleStateChange('chaos_injection.abort', null);
                          return;
                        }
                        const numValue = Number(value);
                        if (!Number.isNaN(numValue)) {
                          handleStateChange('chaos_injection.abort', numValue);
                        }
                      }}
                      className="w-28 bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                      placeholder="ej 500"
                      min={100}
                      max={599}
                    />
                  </div>


                  <div className="w-full">
                  <label className="text-sm text-gray-600">Probabilidad (%)</label>
                  <input
                    type="number"
                    value={escenario.chaos_injection.abortProbability ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d*$/.test(value) && Number(value) >= 0 && Number(value) <= 100)) {
                        handleStateChange('chaos_injection.abortProbability', value);
                      }
                    }}
                    onBlur={() => {
                      const numValue = Number(escenario.chaos_injection.abortProbability);
                      if (!Number.isNaN(numValue)) {
                        handleStateChange('chaos_injection.abortProbability', numValue);
                      }
                    }}
                    className="w-28 bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                    placeholder="0-100"
                  />
                  </div>
                </div>
              )}

                



                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Habilitar Error</label>
                  <input
                    type="checkbox"
                    checked={escenario.chaos_injection.error !== null}
                    onChange={(e) => handleStateChange('chaos_injection.error', e.target.checked ? 500 : null)}
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>
                {escenario.chaos_injection.error !== null && (
                  <div className="flex flex-col items-center gap-2 pl-4">
                    <div className="w-full">
                    <label className="text-sm text-gray-600">Código de Error</label>
                    <input
                      type="number"
                      value={escenario.chaos_injection.error}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleStateChange('chaos_injection.error', null);
                          return;
                        }
                        const numValue = Number(value);
                        if (!Number.isNaN(numValue)) {
                          handleStateChange('chaos_injection.error', numValue);
                        }
                      }}                      
                      className="w-28 bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                      placeholder="e.g. 500"
                      min={100}
                      max={599}
                    />
                    </div>
                    <div className="w-full">
                  <label className="text-sm text-gray-600">Probabilidad (%)</label>
                  <input
                    type="number"
                    value={escenario.chaos_injection.errorProbability ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d*$/.test(value) && Number(value) >= 0 && Number(value) <= 100)) {
                        handleStateChange('chaos_injection.errorProbability', value);
                      }
                    }}
                    onBlur={() => {
                      const numValue = Number(escenario.chaos_injection.errorProbability);
                      if (!Number.isNaN(numValue)) {
                        handleStateChange('chaos_injection.errorProbability', numValue);
                      }
                    }}
                    className="w-28 bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                    placeholder="0-100"
                  />
                  </div>

                    <div className="w-full">
                    <label className="text-sm font-bold text-gray-600 mb-2">Response</label>
                    <textarea
                      value={escenario.async.request}
                      onChange={(e) => handleStateChange('async.request', e.target.value)}
                      className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                      rows={5}
                    />
                    </div>
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
      <label className="block text-sm font-bold text-gray-600 mb-2">Response</label>
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
