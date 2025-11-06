import React from 'react';
import {Settings, BarChart3 , FileClock} from 'lucide-react'
import { Button } from "../components/Button"


interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}



const Sidebar: React.FC<SidebarProps> = ({ activeItem, setActiveItem }) => {
  const menuItems = ['Ajustes', 'Métricas', 'Reportes'];
  return (
    <aside className="w-64 p-6 flex flex-col shrink-0">      
    <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item} className="mb-2">
              <Button
                type="button"
                onClick={() => setActiveItem(item)}
                active={activeItem === item}
                variant="ghost"
                className="relative"
              >
                {item === 'Ajustes' && <Settings />}
                {item === 'Reportes' && <FileClock />}
                {item === 'Métricas' && <BarChart3 />}

                <span className="font-medium">{item}</span> 
              </Button>
            </li>
          ))}
        </ul>
    </nav>
    </aside>
  );
};

export default Sidebar;
