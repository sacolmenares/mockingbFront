import { useState, useImperativeHandle, forwardRef } from 'react';
import { EndpointInput } from './Endpointinput.tsx';
import { StatusCode } from './StatusCode.tsx';
import  Latency  from './Latency.tsx'
import { InyeccionDelCaos } from './CaosInyection.tsx';




export interface PanelAjustesIndvRef {
  getEscenarioData: () => any;
}

export const PanelAjustesIndv = forwardRef<PanelAjustesIndvRef>((_, ref) => {
  const [endpointPath, setEndpointPath] = useState('/api/v1/ruta/del/recurso');
  const [method, setMethod] = useState<string>('GET');
  const [baseResponse, setBaseResponse] = useState(200);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [inyeccionCaos, setInyeccionCaos] = useState(false);
  const [porcentajeFallo, setPorcentajeFallo] = useState<number>(0);
  const [codigoCaos, setCodigoCaos] = useState<number | null>(null);



  const [pathError, setPathError] = useState<string | null>(null);

  // Exponer función para obtener datos del escenario
  useImperativeHandle(ref, () => ({
    getEscenarioData: () => {
      if (pathError) {
        return null; // Indica que hay error
      }
      return {
        method: method,
        path: endpointPath,
        baseResponse: baseResponse,
        latencyMs: latencyMs,
        latencyPercent: Math.round((latencyMs / 5000) * 100),
        chaosEnabled: inyeccionCaos,
        chaosFailurePercent: inyeccionCaos ? porcentajeFallo : 0,
        chaosCode: inyeccionCaos ? (codigoCaos || 500) : 0
      };
    }
  }));
const handlePathChange = (newPath: string) => {
  setEndpointPath(newPath); 


  //Para validar que tenga el lenguaje correcto (Lenguaje regular)
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






  return (
    <div className="bg-gray-200 text-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">


      <div>
        <div className="space-y-6">
          <EndpointInput
            method={method}
            path={endpointPath}
            onMethodChange={setMethod}
            //onPathChange={setEndpointPath} 
            onPathChange={handlePathChange}
          />
          {pathError && (
            <p className="text-xs text-red-600 -mt-4 ml-2">{pathError}</p>
            )}
        
        <StatusCode
            label="Respuesta base"
            value={baseResponse}
            onChange={setBaseResponse}
          />
        
        </div>

        <Latency value={latencyMs} onChange={setLatencyMs} />

        <InyeccionDelCaos
            inyeccionCaos={inyeccionCaos}
            setInyeccionCaos={setInyeccionCaos}
            porcentajeFallo={porcentajeFallo}
            setPorcentajeFallo={setPorcentajeFallo}
            codigoCaos={codigoCaos}
            setCodigoCaos={setCodigoCaos}
/>



      </div>
    </div>
  );
});

//Boton de aplicar, se pondra uno global que se encargue de enviar toda las peticiones
/**
         <div className="pt-10 flex justify-center"> 
            <Button
              variant="ghost"
              className="w-auto px-6 py-2 border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white"
              onClick={handleSubmit}>
                APLICAR
            </Button>
          </div>
 */