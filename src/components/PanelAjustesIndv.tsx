import { useState, useImperativeHandle, forwardRef } from 'react';
import { EndpointInput } from './Endpointinput.tsx';
import { StatusCode } from './StatusCode.tsx';
import Latency from './Latency.tsx';
import { X } from 'lucide-react';
import { FieldWithError } from "./FieldWithError.tsx";
import type { Location as LocationBackend } from "../models/backendModels";
import type { EscenarioUI } from "../types/escenarioUI.ts";
import { mapUIToBackend } from "../mapeo/mapeoDatos";

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
        status_code: (initialData as any)?.status_code || 200,
        headers: initialData?.headers || { 'Content-Type': 'application/json' },
        response: initialData?.response || '{"message": "success"}',
        chaosInjection: (initialData as EscenarioUI)?.chaosInjection,
        async: (initialData as EscenarioUI)?.async ?? {
          enabled: false,
          url: "",
          method: "POST",
          body: "",
          headers: {},
        },        
      });

  const [validationErrors] = useState<Record<string, string>>({})

  const [pathError, setPathError] = useState<string | null>(null);

  const handleStateChange = (field: string, value: any) => {
    const keys = field.split('.');
    setEscenario(prevState => {
      let newState = JSON.parse(JSON.stringify(prevState)) as EscenarioUI;
      let current: any = newState;
      
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
          body: '',
          headers: {},
        };
      }
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          if (keys[i] === 'chaosInjection') {
            current[keys[i]] = { enabled: false, latency: null, abort: null, error: null, errorResponse: null };
          } else if (keys[i] === 'async') {
            current[keys[i]] = { enabled: false, url: '', method: 'POST', body: '', headers: {} };
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

  useImperativeHandle(ref, () => ({
    getEscenarioData: () => {
      return mapUIToBackend(escenario);
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
    <div className="bg-transparent text-gray-800 dark:text-gray-200">
      <div className="space-y-6">

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 transition-colors">
        <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-3">Headers</h3> 
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
                className="w-1/3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200
                          border border-gray-200 dark:border-gray-700 p-2 rounded-lg text-sm
                          transition-colors duration-300"
                placeholder="Nombre"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newHeaders = { ...(escenario.headers || {}), [key]: e.target.value };
                  handleStateChange('headers', newHeaders);
                }}
                className="w-2/3 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm text-gray-800 
                          dark:text-white border border-transparent dark:border-gray-700"
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
          <label className="block text-sm font-bold text-gray-200 mb-2">Response</label>
          <textarea 
            value={escenario.response}
            onChange={(e) => handleStateChange('response', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            rows={5}
          />
        </FieldWithError>


        <FieldWithError error={validationErrors["schema"]}>
          <label className="block text-sm font-bold text-gray-200 mb-2">Schema</label>
          <textarea
            value={escenario.schema ?? ''}
            onChange={(e) => handleStateChange('schema', e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            rows={5}
          />
        </FieldWithError>

        <FieldWithError error={validationErrors["status_code"]}>
          <StatusCode
            label ="Status Code"
            value={escenario.status_code}
            onChange={(v) => handleStateChange('status_code', v)}
          />
        </FieldWithError>

  
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-3">Chaos Injection</h3>
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
                <label className="text-sm text-gray-600 dark:text-gray-100 transition-colors">
                  Habilitar Latencia
                </label>
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
                  <label className="text-sm text-gray-600 dark:text-gray-100 transition-colors">
                  Probabilidad (%)
                  </label>
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
                    className="w-28 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border-transparent"
                    placeholder="0-100"
                  />
                  </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-100 transition-colors">
                  Habilitar Abort
                </label>
                  <input
                    type="checkbox"
                    checked={escenario.chaosInjection?.abort !== null && escenario.chaosInjection?.abort !== undefined}
                    onChange={(e) =>
                      handleStateChange('chaosInjection.abort', e.target.checked ? "" : null)
                    }                    
                    className="h-5 w-5 rounded accent-green-600"
                  />
                </div>
                {escenario.chaosInjection?.abort !== null && (
                <div className="flex flex-col items-center gap-2 pl-4">
                  <div className="w-full">
                  <label className="text-sm text-gray-600 dark:text-gray-100 transition-colors">
                      Código</label>
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
                          handleStateChange('chaosInjection.abort', ' ');
                          return;
                        }
                        const numValue = Number(value);
                        if (!Number.isNaN(numValue)) {
                          handleStateChange('chaosInjection.abort', numValue);
                        }
                      }}
                      className="w-28 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border-transparent"
                      placeholder="ej 500"
                      min={100}
                      max={599}
                    />
                  </div>


                  <div className="w-full">
                  <label className="text-sm text-gray-600 dark:text-gray-100 transition-colors">
                  Probabilidad (%)</label>
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
                    className="w-28 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border-transparent"
                    placeholder="0-100"
                  />
                  </div>
                </div>
              )}

                



                <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 dark:text-gray-100 transition-colors">
                  Habilitar Error</label>
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
                    <label className="text-sm text-gray-600 dark:text-gray-100 transition-colors">
                    Código de Error</label>
                    <input
                      type="number"
                      value={escenario.chaosInjection.error}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          handleStateChange('chaosInjection.error', '');
                          return;
                        }
                        const numValue = Number(value);
                        if (!Number.isNaN(numValue)) {
                          handleStateChange('chaosInjection.error', numValue);
                        }
                      }}                      
                      className="w-28 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border-transparent"
                      placeholder="ej. 500"
                      min={100}
                      max={599}
                    />
                    </div>
                    <div className="w-full">
                    <label className="text-sm text-gray-600 dark:text-gray-100 transition-colors">
                    Probabilidad (%)</label>
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
                    className="w-28 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 border-transparent"
                    placeholder="0-100"
                  />
                  </div>

                    <div className="w-full">
                    <label className="text-sm font-bold text-gray-600 mb-2 dark:text-gray-100">Response</label>
                    <textarea
                      value={escenario.chaosInjection?.errorResponse || ''}
                      onChange={(e) => handleStateChange('chaosInjection.errorResponse', e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
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
            <h3 className="text-md font-bold text-gray-700 dark:text-gray-300 mb-3">Async</h3>
            <input type="checkbox" 
            checked={escenario.async?.enabled ?? false} 
            onChange={(e) => handleStateChange('async.enabled', e.target.checked)} 

            className="h-5 w-5 rounded accent-green-600"/>
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
      <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-100">Response</label>
      <textarea
        value={escenario.async?.body || ''}
        onChange={(e) => handleStateChange('async.body', e.target.value)}
        className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
        rows={3}
      />
    </div>


    <div>
      <label className="block text-sm font-bold text-gray-600 mb-2 dark:text-gray-100">Headers</label>
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
                className="w-1/3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200
                          border border-gray-200 dark:border-gray-700 p-2 rounded-lg text-sm
                          transition-colors duration-300"
                placeholder="Nombre"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const newHeaders = { ...(escenario.async?.headers || {}), [key]: e.target.value };
                  handleStateChange('async.headers', newHeaders);
                }}
                className="w-2/3 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg text-sm text-gray-800 
                          dark:text-white border border-transparent dark:border-gray-700"
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
