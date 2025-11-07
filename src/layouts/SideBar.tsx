import React from 'react';
import {Settings, BarChart3 , FileClock} from 'lucide-react'
import { Button } from "../components/Button"
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, setActiveItem }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { name: 'Ajustes', path: '/ajustes' },
    { name: 'Métricas', path: '/metricas' },
    { name: 'Reportes', path: '/reportes' }
  ];

  const handleNavigation = (itemName: string, path: string) => {
    setActiveItem(itemName);
    navigate(path);
  };

  // Determinar el item activo basándose en la ruta actual
  const currentItem = menuItems.find(item => location.pathname === item.path);

  return (
    <aside className="w-64 p-6 flex flex-col shrink-0">      
    <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Button
                type="button"
                onClick={() => handleNavigation(item.name, item.path)}
                active={activeItem === item.name || (currentItem?.name === item.name)}
                variant="ghost"
                className="relative"
              >
                {item.name === 'Ajustes' && <Settings />}
                {item.name === 'Reportes' && <FileClock />}
                {item.name === 'Métricas' && <BarChart3 />}

                <span className="font-medium">{item.name}</span> 
              </Button>
            </li>
          ))}
        </ul>
    </nav>
    </aside>
  );
};

export default Sidebar;
