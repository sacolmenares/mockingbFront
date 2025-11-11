import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { BaseLayout } from './layouts/baseLayout'; 
import AjustesPage from "./pages/ajustes.tsx";
import MetricasPage from "./pages/metricas.tsx";
import ReportesPage from "./pages/reportes.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BaseLayout />}>
          <Route index element={<Navigate to="/ajustes" replace />} />
          <Route path="ajustes" element={<AjustesPage />} />
          <Route path="metricas" element={<MetricasPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}