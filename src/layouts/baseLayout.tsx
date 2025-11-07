import React, { useState } from "react";
import { PageHeader } from "../layouts/PageHeader";
import Sidebar from "../layouts/SideBar";
import { Outlet } from "react-router-dom";

export const BaseLayout: React.FC = () => {
  const [activeItem, setActiveItem] = useState("Métricas");

  return (
    <div className="flex flex-col h-screen">
      <header className="flex-shrink-0">
        <PageHeader />
      </header>


      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeItem={activeItem} setActiveItem={setActiveItem} />

   
        <main className="flex-1 bg-gray-50 p-6 overflow-auto rounded-tl-2xl shadow-inner">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
