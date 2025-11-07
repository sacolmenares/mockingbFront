import SideBar from './layouts/SideBar.tsx'; 
import { PageHeader } from './layouts/PageHeader.tsx';
import AjustesPage from "./pages/ajustes.tsx";
import MetricasPage from "./pages/metricas.tsx"
import ReportesPage from "./pages/reportes.tsx";
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useState } from 'react';

function AppContent() {
  const [activeItem, setActiveItem] = useState('Ajustes');

  return (
    <div className="h-screen flex flex-col text-white" >
      <PageHeader/>
      <div className="flex flex-1 overflow-hidden">
      <SideBar activeItem={activeItem} setActiveItem={setActiveItem} />
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
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
