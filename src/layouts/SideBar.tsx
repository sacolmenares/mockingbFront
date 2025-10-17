import React from 'react';
import {Settings, ChartNoAxesColumnIncreasing } from 'lucide-react'
import { Button } from "../components/Button"


interface SidebarProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
}

/* Logos SVG (Reemplazados con iconos de lucide-react)
const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cog-icon lucide-cog"><path d="M11 10.27 7 3.34"/><path d="m11 13.73-4 6.93"/><path d="M12 22v-2"/><path d="M12 2v2"/><path d="M14 12h8"/><path d="m17 20.66-1-1.73"/><path d="m17 3.34-1 1.73"/><path d="M2 12h2"/><path d="m20.66 17-1.73-1"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m3.34 7 1.73 1"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="12" r="8"/></svg>
);
const ReportsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-no-axes-column-increasing-icon lucide-chart-no-axes-column-increasing"><path d="M5 21v-6"/><path d="M12 21V9"/><path d="M19 21V3"/></svg>
);
*/


const Sidebar: React.FC<SidebarProps> = ({ activeItem, setActiveItem }) => {
  const menuItems = ['Ajustes', 'Reportes'];
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
              >
                {item === 'Ajustes' && <Settings />}
                {item === 'Reportes' && <ChartNoAxesColumnIncreasing />}
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
