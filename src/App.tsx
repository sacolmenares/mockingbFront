import { useState} from 'react';
import SideBar from './layouts/SideBar.tsx'; 
import { PageHeader } from './layouts/PageHeader.tsx';
import { PanelAjustes } from './components/PanelAjustes.tsx';
import { Metricas } from './components/PanelMetricas.tsx';
import { PanelReportes } from './components/PanelReportes.tsx';


export default function App() {
  const [activeItem, setActiveItem] = useState('Ajustes');
  const [reportesCount, setReportesCount] = useState(0);

  return (
    <div className="h-screen flex flex-col text-white" >
      <PageHeader/>
      <div className="flex flex-1 overflow-hidden">
        <SideBar activeItem={activeItem} setActiveItem={setActiveItem} reportesCount={reportesCount} />
          <main className="flex-1 p-10 overflow-y-auto ">
          {activeItem === 'Ajustes' && <PanelAjustes onAjustesAplicados={setReportesCount} />}
          {activeItem === 'Métricas' && <Metricas />}
          {activeItem === 'Reportes' && <PanelReportes reportesCount={reportesCount} onReportesVistos={() => setReportesCount(0)} />}
        </main>
      </div>
    </div>
    
  );
}

