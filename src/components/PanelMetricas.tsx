import { useEffect } from 'react';

const animationcss = `
@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}
.animate-fadeIn { 
    animation: fadeIn 0.5s ease-out forwards; 
}
`;

let isStyleInjected = false;

function injectAnimationStyles() {
    // Evita inyectar los estilos varias veces
    if (isStyleInjected || typeof document === 'undefined') {
        return;
    }
    
    const style = document.createElement("style");
    style.innerHTML = animationcss;
    document.head.appendChild(style);
    isStyleInjected = true;
}


export function PanelMetricas() {
    useEffect(() => {
        injectAnimationStyles();
    }, []); 

    return (
        <div className="bg-gray-200 text-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Métricas</h1>
            <div className="bg-gray-100 text-gray-800 p-4 rounded-3xl shadow-3xl mx-auto">
                <p className="italic">Aquí aparecen métricas (Prometheus)</p>
            </div>
        </div>
    );
}


    /*
    <div className="bg-gray-200 text-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Métricas</h1>
      <div className="bg-gray-100 text-gray-800 p-6 rounded-3xl shadow-3xl">
        <p className="text-lg text-gray-700 mb-4">Aquí se mostrarán las métricas del servidor (datos de la bd)</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Requests Totales</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Errores</h3>
            <p className="text-3xl font-bold text-red-600">0</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Latencia Promedio</h3>
            <p className="text-3xl font-bold text-green-600">0ms</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-300">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Disponibilidad</h3>
            <p className="text-3xl font-bold text-purple-600">100%</p>
          </div>
        </div>
      </div>
    </div>
    */