// BaseLayout.tsx
import React, { useState, useEffect } from "react";
import { PageHeader } from "../layouts/PageHeader";
import Sidebar from "../layouts/SideBar";
import { Outlet } from "react-router-dom";
import { InicialAnimationLoadingLogo } from "../components/inicialAnimationLogo";

export const BaseLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-950 transition-colors duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>

        <div className="relative z-10 w-64 h-64 md:w-80 md:h-80">
          <InicialAnimationLoadingLogo />
        </div>
      </div>
    );
  }

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