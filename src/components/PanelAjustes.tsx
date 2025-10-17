import { useState, useRef } from "react";
import { PanelAjustesIndv } from "./PanelAjustesIndv";
import type { PanelAjustesIndvRef } from "./PanelAjustesIndv";
import { Button } from "./Button";

interface PanelAjustesProps {
  onAjustesAplicados: (count: number) => void;
}

export function PanelAjustes({ onAjustesAplicados }: PanelAjustesProps) {
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
    let validEscenarios = 0;

    escenarios.forEach((escenario, index) => {
      const panelRef = panelRefs.current[escenario.id];
      if (panelRef) {
        const data = panelRef.getEscenarioData();
        if (data === null) {
          hasErrors = true;
        } else {
          validEscenarios++;
          // Descargar cada escenario como archivo separado
          const fileContent = JSON.stringify(data, null, 2);
          const blob = new Blob([fileContent], { type: 'text/plain' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `escenario_${index + 1}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });

    if (hasErrors) {
      alert("No se pueden guardar algunos escenarios: Hay errores en las rutas de endpoints.");
    } else if (validEscenarios === 0) {
      alert("No hay escenarios válidos para guardar.");
    } else {
      alert(`Se han descargado ${validEscenarios} escenario(s) exitosamente.`);
      
      // Notificar la cantidad de reportes que se van a recibir
      onAjustesAplicados(validEscenarios);
 
      // Resetear después de aplicar
      setReseteando(true);
      setTimeout(() => {
        setEscenarios([{ id: Date.now() }]); 
        panelRefs.current = {}; 
        setEliminando(null); 
        setReseteando(false); 
      }, 1000); 
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gray-100 rounded-2xl shadow-lg">
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
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 font-medium">Aplicando ajustes...</span>
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

