import React from 'react';
import { Settings, BarChart3, FileClock } from 'lucide-react';
import { Button } from "../components/Button";
import { useNavigate, useLocation } from 'react-router-dom';


const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { name: 'Ajustes', path: '/ajustes', icon: <Settings /> },
    { name: 'Métricas', path: '/metricas', icon: <BarChart3 /> },
    { name: 'Reportes', path: '/reportes', icon: <FileClock /> }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };


  const currentItem = menuItems.find(item => location.pathname === item.path);

  return (
    <aside className="w-64 p-6 flex flex-col shrink-0">      
    <nav>
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="mb-2">
              <Button
                type="button"
                onClick={() => handleNavigation(item.path)}
                active={currentItem?.name === item.name}
                variant="ghost"
                className="relative"
              >
                {item.icon}
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