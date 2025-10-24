import React from 'react';

// Agregar animación CSS
const style = document.createElement("style");
style.innerHTML = `
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
document.head.appendChild(style);



interface PanelReportesProps {
  reportesCount: number;
  onReportesVistos: () => void;
}

export function PanelReportes({ reportesCount, onReportesVistos }: PanelReportesProps) {
  const [mostrarMensaje, setMostrarMensaje] = React.useState(false);

  // Mostrar mensaje cuando hay reportes y limpiar después de un tiempo
  React.useEffect(() => {
    if (reportesCount > 0) {
      setMostrarMensaje(true);
      // Limpiar el contador después de 3 segundos para que el usuario pueda ver el mensaje
      const timer = setTimeout(() => {
        onReportesVistos();
        setMostrarMensaje(false);
      }, 15000);
      
      // Si el usuario cambia de pestaña o minimiza la ventana
      const handleVisibilityChange = () => {
        if (document.hidden) {
          onReportesVistos();
          setMostrarMensaje(false);
        }
      };

// Escuchar el evento
document.addEventListener("visibilitychange", handleVisibilityChange);



      return () => clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }, [reportesCount, onReportesVistos]);

  return (
    <div className="bg-gray-200 text-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reportes</h1>
        <div className="bg-gray-100 text-gray-800 p-4 rounded-3xl shadow-3xl mx-auto">
        <p className="italic">Aquí muestra historial de operaciones (bd)</p>
        {mostrarMensaje && reportesCount > 0 && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fadeIn">
            <p className="font-medium text-lg">¡Se aplicaron {reportesCount} ajuste(s) exitosamente!</p>
            <p className="text-sm mt-1">Los reportes correspondientes estarán disponibles próximamente.</p>
          </div>
        )}
        </div>
    </div>
  );
}