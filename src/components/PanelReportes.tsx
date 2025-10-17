import { useState } from 'react';
import { EndpointInput } from './Endpointinput.tsx';
import { Button } from './Button';



export function PanelReportes() {

  return (
    <div className="bg-gray-200 text-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Reportes</h1>
        <div className="bg-gray-100 text-gray-800 p-4 rounded-3xl shadow-3xl mx-auto">
        <p className="italic">Proximamente aquí las métricas en conexion con Prometheus</p>
        </div>
    </div>
  );
}