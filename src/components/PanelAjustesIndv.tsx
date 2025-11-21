import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { EndpointInput } from './Endpointinput.tsx';
import { StatusCode } from './StatusCode.tsx';
import Latency from './Latency.tsx';
import { X } from 'lucide-react';
import { EscenarioStateSchema } from "../validations/endpoint.squema";
import { FieldWithError } from "./FieldWithError.tsx";
import type { Location as LocationBackend } from "../models/backendModels";
//import { mapBackendToUI } from "../mapeo/mapeoDatos.ts";
import type { EscenarioUI } from "../types/escenarioUI.ts";


/*
interface UIAsyncConfig extends AsyncConfigBackend {
  enabled: boolean;
}

interface UIChaosInjection {
  enabled: boolean;
  latency: number | null;
  latencyProbability?: number | string | null;
  abort: boolean | number | null;
  abortProbability?: number | string | null;
  error: number | null;
  errorProbability?: number | string | null;
}*/



export interface PanelAjustesIndvRef {
  getEscenarioData: () => any;
  setEscenarioData: (data: Partial<EscenarioUI> | null) => void;
}


export const PanelAjustesIndv = forwardRef<
  PanelAjustesIndvRef,
  { initialData?: Partial<EscenarioUI> | LocationBackend; selectedServer: string }
>(({ initialData }, ref) => {

    

    const [escenario, setEscenario] = useState<EscenarioUI>({
        path: initialData?.path || '/api/v1/ruta/del/recurso',
        method: initialData?.method || 'GET',
        schema: initialData?.schema ?? undefined,
        statusCode: (initialData as any)?.statusCode || (initialData as any)?.status_code || 200,
        headers: initialData?.headers || { 'Content-Type': 'application/json' },
        response: initialData?.response || '{"message": "success"}',
        chaosInjection: undefined,        
        async: undefined, //Para que no active por default async
      });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

      
      


      
      
  const [pathError, setPathError] = useState<string | null>(null);

  const handleStateChange = (field: string, value: any) => {
    const keys = field.split('.');
    setEscenario(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState)) as EscenarioUI;
      let current: any = newState;
      
      // Asegurar que las propiedades opcionales existan
      if (keys[0] === 'chaosInjection' && !newState.chaosInjection) {
        newState.chaosInjection = {
          enabled: false,
          latency: null,
          abort: null,
          error: null,
          errorResponse: null,
        };
      }
      if (keys[0] === 'async' && !newState.async) {
        newState.async = {
          enabled: false,
          url: '',
          method: 'POST',
          timeout: 5000,
          retries: 3,
          retryDelay: 1000,
          body: '',
          headers: {},
        };
      }
      
      // Navegar hasta el objeto padre
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          if (keys[i] === 'chaosInjection') {
            current[keys[i]] = { enabled: false, latency: null, abort: null, error: null, errorResponse: null };
          } else if (keys[i] === 'async') {
            current[keys[i]] = { enabled: false, url: '', method: 'POST', timeout: 5000, retries: 3, retryDelay: 1000, body: '', headers: {} };
          } else {
            current[keys[i]] = {};
          }
        }
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

  
  const validateEscenario = () => {
    // Convertir EscenarioUI a EscenarioState para validación
    const escenarioForValidation = {
      ...escenario,
      status_code: escenario.statusCode,
      chaos_injection: escenario.chaosInjection ? {
        enabled: escenario.chaosInjection.enabled,
        latency: escenario.chaosInjection.latency,
        latencyProbability: escenario.chaosInjection.latencyProbability,
        abort: escenario.chaosInjection.abort,
        abortProbability: escenario.chaosInjection.abortProbability,
        error: escenario.chaosInjection.error,
        errorProbability: escenario.chaosInjection.errorProbability,
      } : {
        enabled: false,
        latency: null,
        abort: null,
        error: null,
      },
      async: escenario.async ? {
        enabled: escenario.async.enabled,
        url: escenario.async.url || 'http://example.com',
        method: escenario.async.method || 'POST',
        timeout: escenario.async.timeout || 5000,
        retries: escenario.async.retries || 3,
        retryDelay: escenario.async.retryDelay || 1000,
        body: escenario.async.body || '{}',
        headers: escenario.async.headers || {},
      } : {
        enabled: false,
        url: 'http://example.com',
        method: 'POST',
        timeout: 5000,
        retries: 3,
        retryDelay: 1000,
        body: '{}',
        headers: {},
      },
    };
    const result = EscenarioStateSchema.safeParse(escenarioForValidation);
    if (!result.success) {
      const errors: Record<string, string> = {};
      if (Array.isArray((result.error as any).issues)) {
        (result.error as any).issues.forEach((err: any) => {
          const path = Array.isArray(err.path) ? err.path.join(".") : "";
          errors[path] = err.message;
          console.error(`Error de validación en ${path}:`, err.message);
        });
      }
      console.error("Errores de validación completos:", errors);
      setValidationErrors(errors);
      return false;
    }
    setValidationErrors({});
    return true;
  };
  

// Función que prepara datos limpios para backend
function prepareEscenarioForBackend(escenario: EscenarioUI) {
  const data: any = {
    path: escenario.path,
    method: escenario.method,
    status_code: escenario.statusCode, 
    response: escenario.response,
  };

  // Schema si existe
  if (escenario.schema) {
    data.schema = escenario.schema;
  }

  // Header si existe
  if (escenario.headers && Object.keys(escenario.headers).length > 0) {
    data.headers = escenario.headers;
  }

  // Async solo si está habilitado
  if (escenario.async?.enabled) {
    data.async = {
      url: escenario.async.url,
      method: escenario.async.method,
      timeout: escenario.async.timeout,
      retries: escenario.async.retries,
      retryDelay: escenario.async.retryDelay,
    };

    if (escenario.async.headers && Object.keys(escenario.async.headers).length > 0) {
      data.async.headers = escenario.async.headers;
    }

    if (escenario.async.body) {
      data.async.body = escenario.async.body;
    }
  }

  // Chaos Injection solo si está habilitado
  if (escenario.chaosInjection?.enabled) {
    const ci: any = {};

    if (escenario.chaosInjection.latency !== null && escenario.chaosInjection.latency !== undefined) {
      ci.latency = {
        time: escenario.chaosInjection.latency,
        probability: escenario.chaosInjection.latencyProbability ?? 0,
      };
    }

    if (escenario.chaosInjection.abort !== null && escenario.chaosInjection.abort !== undefined) {
      ci.abort = {
        code: typeof escenario.chaosInjection.abort === 'boolean' ? 500 : escenario.chaosInjection.abort,
        probability: escenario.chaosInjection.abortProbability ?? 0,
      };
    }

    if (escenario.chaosInjection.error !== null && escenario.chaosInjection.error !== undefined) {
      ci.error = {
        code: escenario.chaosInjection.error,
        probability: escenario.chaosInjection.errorProbability ?? 0,
        response: escenario.chaosInjection.errorResponse ?? "",
      };
    }

    // Solo agrega chaosInjection si tiene algo
    if (Object.keys(ci).length > 0) {
      data.chaosInjection = ci;
    }
    }
    return data;
}



  useImperativeHandle(ref, () => ({


    getEscenarioData: () => {
      if (pathError) {
          console.warn("Error de ruta (pathError) detectado, devolviendo null.");
          return null;
      }
      const data = prepareEscenarioForBackend(escenario);
        return data;
    },

    setEscenarioData: (data: Partial<EscenarioUI> | null) => {
      if (!data) return;

    setEscenario((prev) => {
        const next = JSON.parse(JSON.stringify(prev)) as EscenarioUI;
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
          <h3 className="text-md font-bold text-gray-700 mb-3">Headers</h3> {/** Headers princiapl */}
          <div>
          {Object.entries((escenario.headers || {})).map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2 mb-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
              <input
                type="text"
                value={key.startsWith('header-') ? '' : key}
                onChange={(e) => {
                  const newKey = e.target.value || `header-${Date.now()}`;
                  const newHeaders = { ...(escenario.headers || {}) };
                  delete newHeaders[key];
                  newHeaders[newKey] = value;
                  handleStateChange('headers', newHeaders);
                }}
                className="w-1/3 bg-gray-100 p-2 rounded-lg text-sm"
                placeholder="Nombre"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newHeaders = { ...(escenario.headers || {}), [key]: e.target.value };
                  handleStateChange('headers', newHeaders);
                }}
                className="w-2/3 bg-gray-100 p-2 rounded-lg text-sm"
                placeholder=" "
              />
              <button
                onClick={() => {
                  const newHeaders = { ...(escenario.headers || {}) };
                  delete newHeaders[key];
                  handleStateChange('headers', newHeaders);
                }}
                className="text-red-500 hover:text-red-700 font-bold transition-transform duration-200 hover:scale-110"
              >
                <X />
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              const newHeaders = { ...(escenario.headers || {}), [`header-${Date.now()}`]: '' };
              handleStateChange('headers', newHeaders);
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

        <FieldWithError error={validationErrors["response"]}>
          <label className="block text-sm font-bold text-gray-600 mb-2">Response</label>
          <textarea 
            value={escenario.response}
            onChange={(e) => handleStateChange('response', e.target.value)}
            className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
            rows={5}
          />
        </FieldWithError>


        <FieldWithError error={validationErrors["schema"]}>
          <label className="block text-sm font-bold text-gray-600 mb-2">Schema</label>
          <textarea
            value={escenario.schema ?? ''}
            onChange={(e) => handleStateChange('schema', e.target.value)}
            className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
            rows={5}
          />
        </FieldWithError>

        <FieldWithError error={validationErrors["status_code"]}>
          <StatusCode
            label="Status Code"
            value={escenario.statusCode}
            onChange={(v) => handleStateChange('statusCode', v)}
          />
        </FieldWithError>

  
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-gray-700">Chaos Injection</h3>
            <input
              type="checkbox"
              checked={escenario.chaosInjection?.enabled ?? false}
              onChange={(e) => handleStateChange('chaosInjection.enabled', e.target.checked)}
              className="h-5 w-5 rounded accent-green-600"
            />
          </div>


            {escenario.chaosInjection?.enabled && (
              <div className="pl-4 border-l-2 border-gray-200 space-y-3 pt-4">

                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600">Habilitar Latencia</label>
                  <input
                    type="checkbox"
                    checked={escenario.chaosInjection?.latency !== null && escenario.chaosInjection?.latency !== undefined}
                    onChange={(e) => handleStateChange('chaosInjection.latency', e.target.checked ? 0 : null)}
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>

                {escenario.chaosInjection?.latency !== null && escenario.chaosInjection?.latency !== undefined && (
                  <div className="flex flex-col items-center gap-2 pl-4">
                    <div className="w-full">
                  <Latency
                    value={escenario.chaosInjection.latency}
                    onChange={(v) => handleStateChange('chaosInjection.latency', v)}
                  />
                  </div>
                  <div className="w-full">
                  <label className="text-sm text-gray-600">Probabilidad (%)</label>
                  <input
                    type="number"
                    value={escenario.chaosInjection.latencyProbability ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d*$/.test(value) && Number(value) >= 0 && Number(value) <= 100)) {
                        handleStateChange('chaosInjection.latencyProbability', value);
                      }
                    }}
                    onBlur={() => {
                      const numValue = Number(escenario.chaosInjection?.latencyProbability);
                      if (!Number.isNaN(numValue)) {
                        handleStateChange('chaosInjection.latencyProbability', numValue);
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
                    checked={escenario.chaosInjection?.abort !== null && escenario.chaosInjection?.abort !== undefined}
                    onChange={(e) => handleStateChange('chaosInjection.abort', e.target.checked ? true : null)}
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>
                {escenario.chaosInjection?.abort == true && (
                <div className="flex flex-col items-center gap-2 pl-4">
                  <div className="w-full">
                    <label className="text-sm text-gray-600">Código</label>
                    <input
                      type="number"
                      value={
                        typeof escenario.chaosInjection?.abort === 'number' ||
                        typeof escenario.chaosInjection?.abort === 'string'
                          ? escenario.chaosInjection.abort
                          : ''
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleStateChange('chaosInjection.abort', null);
                          return;
                        }
                        const numValue = Number(value);
                        if (!Number.isNaN(numValue)) {
                          handleStateChange('chaosInjection.abort', numValue);
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
                    value={escenario.chaosInjection?.abortProbability ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d*$/.test(value) && Number(value) >= 0 && Number(value) <= 100)) {
                        handleStateChange('chaosInjection.abortProbability', value);
                      }
                    }}
                    onBlur={() => {
                      const numValue = Number(escenario.chaosInjection?.abortProbability);
                      if (!Number.isNaN(numValue)) {
                        handleStateChange('chaosInjection.abortProbability', numValue);
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
                    checked={escenario.chaosInjection?.error !== null && escenario.chaosInjection?.error !== undefined}
                    onChange={(e) => handleStateChange('chaosInjection.error', e.target.checked ? 500 : null)}
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>
                {escenario.chaosInjection?.error !== null && escenario.chaosInjection?.error !== undefined && (
                  <div className="flex flex-col items-center gap-2 pl-4">
                    <div className="w-full">
                    <label className="text-sm text-gray-600">Código de Error</label>
                    <input
                      type="number"
                      value={escenario.chaosInjection.error}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleStateChange('chaosInjection.error', null);
                          return;
                        }
                        const numValue = Number(value);
                        if (!Number.isNaN(numValue)) {
                          handleStateChange('chaosInjection.error', numValue);
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
                    value={escenario.chaosInjection?.errorProbability ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (/^\d*$/.test(value) && Number(value) >= 0 && Number(value) <= 100)) {
                        handleStateChange('chaosInjection.errorProbability', value);
                      }
                    }}
                    onBlur={() => {
                      const numValue = Number(escenario.chaosInjection?.errorProbability);
                      if (!Number.isNaN(numValue)) {
                        handleStateChange('chaosInjection.errorProbability', numValue);
                      }
                    }}
                    className="w-28 bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
                    placeholder="0-100"
                  />
                  </div>

                    <div className="w-full">
                    <label className="text-sm font-bold text-gray-600 mb-2">Response</label>
                    <textarea
                      value={escenario.chaosInjection?.errorResponse || ''}
                      onChange={(e) => handleStateChange('chaosInjection.errorResponse', e.target.value)}
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
            <input type="checkbox" checked={escenario.async?.enabled ?? false} onChange={(e) => handleStateChange('async.enabled', e.target.checked)} className="h-5 w-5 rounded accent-green-600"/>
          </div>

          {escenario.async?.enabled && (
        <div className="pl-4 border-l-2 border-gray-200 space-y-4 pt-4">

        <EndpointInput
          method={escenario.async?.method || 'POST'} 
          path={escenario.async?.url || ''}         
          onMethodChange={(v) => handleStateChange('async.method', v)} 
          onPathChange={(v) => handleStateChange('async.url', v)}    
        />
    <div>
      <label className="block text-sm font-bold text-gray-600 mb-2">Response</label>
      <textarea
        value={escenario.async?.body || ''}
        onChange={(e) => handleStateChange('async.body', e.target.value)}
        className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
        rows={3}
      />
    </div>


    <div>
      <label className="block text-sm font-bold text-gray-600 mb-2">Headers</label>
      {Object.entries(escenario.async?.headers || {}).map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2 mb-2 transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
              <input
                type="text"
                value={key.startsWith('header-') ? '' : key}
                onChange={(e) => {
                  const newKey = e.target.value || `header-${Date.now()}`;
                  const newHeaders = { ...(escenario.async?.headers || {}) };
                  delete newHeaders[key];
                  newHeaders[newKey] = value;
                  handleStateChange('async.headers', newHeaders);
                }}
                className="w-1/3 bg-gray-100 p-2 rounded-lg text-sm"
                placeholder="Nombre"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newHeaders = { ...(escenario.async?.headers || {}), [key]: e.target.value };
                  handleStateChange('async.headers', newHeaders);
                }}
                className="w-2/3 bg-gray-100 p-2 rounded-lg text-sm"
                placeholder=" "
              />
              <button
                onClick={() => {
                  const newHeaders = { ...(escenario.async?.headers || {}) };
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
              const newHeaders = { ...(escenario.async?.headers || {}) };

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
