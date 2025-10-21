import { useState, useImperativeHandle, forwardRef } from 'react';
import { EndpointInput } from './Endpointinput.tsx';
import { StatusCode } from './StatusCode.tsx';
import Latency from './Latency.tsx'; 



interface AsyncConfig {
  enabled: boolean;
  url: string;
  method: string;
  timeout: number;
  retries: number;
  retryDelay: number;
}

interface ChaosConfig {
  latency: number | null; 
  abort: boolean;   
  error: number | null; 
}


interface EscenarioState {
  path: string;
  method: string;
  schema: string;
  status_code: number;
  headers: { 'Content-Type': string };
  response: string; 
  async: AsyncConfig;
  chaos_injection: ChaosConfig;
}

export interface PanelAjustesIndvRef {
  getEscenarioData: () => any;
}

export const PanelAjustesIndv = forwardRef<PanelAjustesIndvRef>((_, ref) => {
  



  const [escenario, setEscenario] = useState<EscenarioState>({
    path: '/api/v1/ruta/del/recurso',
    method: 'GET',
    schema: 'schemas/request.json',
    status_code: 200,
    headers: { 'Content-Type': 'application/json' },
    response: '{"message": "success"}',
    async: {
      enabled: false,
      url: 'http://callback.example.com',
      method: 'POST',
      timeout: 5000,
      retries: 3,
      retryDelay: 1000,
    },
    chaos_injection: {
      latency: null, 
      abort: false,
      error: null,   
    },
  });

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
      if (pathError) {
        return null; 
      }
      return escenario;
    }
  }));
  

  const chaosErrorOptions = [ { value: 500, label: '500 Error' }, { value: 503, label: '503 Unavailable' } ];

  return (


    <div className="bg-white text-gray-800 p-6 rounded-2xl shadow-md border border-gray-200">
      <div className="space-y-6">
        

        <EndpointInput
          method={escenario.method}
          path={escenario.path}
          onMethodChange={(v) => handleStateChange('method', v)}
          onPathChange={handlePathChange}
        />
        {pathError && (<p className="text-xs text-red-600 -mt-4 ml-2">{pathError}</p>)}
        
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Schema</label>
          <input 
            type="text"
            value={escenario.schema}
            onChange={(e) => handleStateChange('schema', e.target.value)}
            className="w-full bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
          />
        </div>
        
        <StatusCode
          label="Status Code"
          value={escenario.status_code}
          onChange={(v) => handleStateChange('status_code', v)}
        />
        
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-2">Response Body (JSON)</label>
          <textarea 
            value={escenario.response}
            onChange={(e) => handleStateChange('response', e.target.value)}
            className="w-full bg-gray-100 p-3 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
            rows={3}
          />
        </div>

        {/* --- Sección de Headers --- */}
        <div className="border-t border-gray-200 pt-4">
           <h3 className="text-md font-bold text-gray-700 mb-2">Headers</h3>
           <div className="flex items-center gap-2">
             <span className="font-mono text-sm p-2 bg-gray-100 rounded">Content-Type:</span>
             <input 
                type="text"
                value={escenario.headers['Content-Type']}
                onChange={(e) => handleStateChange('headers.Content-Type', e.target.value)}
                className="w-full bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-transparent"
             />
           </div>
        </div>


        <div className="border-t border-gray-200 pt-4 space-y-3">
          <h3 className="text-md font-bold text-gray-700">Chaos Injection (Location)</h3>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Habilitar Latencia</label>
            <input type="checkbox" checked={escenario.chaos_injection.latency !== null} onChange={(e) => handleStateChange('chaos_injection.latency', e.target.checked ? 0 : null)} className="h-5 w-5 rounded accent-green-600"/>
          </div>

          {escenario.chaos_injection.latency !== null && (
             <Latency value={escenario.chaos_injection.latency} onChange={(v) => handleStateChange('chaos_injection.latency', v)} />
          )}

           <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Habilitar Abort</label>
            <input type="checkbox" checked={escenario.chaos_injection.abort} onChange={(e) => handleStateChange('chaos_injection.abort', e.target.checked)} className="h-5 w-5 rounded accent-green-600"/>
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Habilitar Error Code</label>
            <input type="checkbox" checked={escenario.chaos_injection.error !== null} onChange={(e) => handleStateChange('chaos_injection.error', e.target.checked ? 500 : null)} className="h-5 w-5 rounded accent-green-600"/>
          </div>

          {escenario.chaos_injection.error !== null && (
            <StatusCode
              label="Error Status Code"
              value={escenario.chaos_injection.error}
              onChange={(v) => handleStateChange('chaos_injection.error', v)}
              options={chaosErrorOptions}
            />
          )}
        </div>


        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-gray-700">Async</h3>
            <input type="checkbox" checked={escenario.async.enabled} onChange={(e) => handleStateChange('async.enabled', e.target.checked)} className="h-5 w-5 rounded accent-green-600"/>
          </div>

          {escenario.async.enabled && (
            <div className="pl-4 border-l-2 border-gray-200 space-y-4 pt-4">
               <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">URL Callback</label>
                  <input type="text" value={escenario.async.url} onChange={(e) => handleStateChange('async.url', e.target.value)} className="w-full bg-gray-100 p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/>
               </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
});
