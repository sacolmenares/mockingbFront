import { useState} from 'react';
import SideBar from './layouts/SideBar.tsx'; 
import { PageHeader } from './layouts/PageHeader.tsx';
import { PanelAjustes } from './components/PanelAjustes.tsx';
import { PanelReportes } from './components/PanelReportes.tsx';


export default function App() {
  const [activeItem, setActiveItem] = useState('Ajustes');

  return (
    <div className="h-screen flex flex-col text-white" >
      <PageHeader/>
      <div className="flex flex-1 overflow-hidden">
        <SideBar activeItem={activeItem} setActiveItem={setActiveItem} />
          <main className="flex-1 p-10 overflow-y-auto ">
          {activeItem === 'Ajustes' && <PanelAjustes/>}
          {activeItem === 'Reportes' && <PanelReportes/>}
        </main>
      </div>
    </div>
    
  );
}

