import React from "react";
import { PageHeader } from "../layouts/PageHeader";
import Sidebar from "../layouts/SideBar";
import { Outlet } from "react-router-dom";

export const BaseLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <header className="flex-shrink-0">
        <PageHeader />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
   
      <main className="flex-1 bg-gray-50 dark:bg-slate-800/50 p-6 overflow-auto rounded-tl-2xl shadow-inner text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Outlet />
      </main>
      </div>
    </div>
  );
};
