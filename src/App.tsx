import SideBar from './layouts/SideBar.tsx'; 
import { PageHeader } from './layouts/PageHeader.tsx';
import AjustesPage from "./pages/ajustes.tsx";
import MetricasPage from "./pages/metricas.tsx"
import ReportesPage from "./pages/reportes.tsx";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
//import { useState } from 'react';

export default function App() {

  return (
    <BrowserRouter>
    <div className="h-screen flex flex-col text-white" >
      <PageHeader/>
      <div className="flex flex-1 overflow-hidden">
        <SideBar/>
        {/** OJO : Da error porque hay que quitar el contador de notificaciones de reportes en sidebar */}
          <main className="flex-1 p-10 overflow-y-auto ">
            <Routes>
              {/** Ruta principal */}
              <Route path="/" element={<Navigate to="/ajustes" replace /> } />

              <Route path="/ajustes" element={<AjustesPage />} />
              <Route path="/metricas" element={<MetricasPage />} />
              <Route path="/reportes" element={<ReportesPage />} />
            </Routes>
        </main>
      </div>
    </div>
    </BrowserRouter>
  );
}
