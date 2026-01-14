import React, { useState, useEffect } from "react";
import { PageHeader } from "../layouts/PageHeader";
import Sidebar from "../layouts/SideBar";
import { Outlet } from "react-router-dom";
import { InicialAnimationLoadingLogo } from "../components/inicialAnimationLogo";
import { motion, AnimatePresence } from "framer-motion"; 

export const BaseLayout: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }} 
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
            <div className="relative z-10 w-64 h-64 md:w-80 md:h-80">
              <InicialAnimationLoadingLogo />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3.5 }}
        className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors duration-300"
      >
        <header className="flex-shrink-0">
          <PageHeader />
        </header>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 bg-gray-50 dark:bg-slate-800/50 p-6 overflow-auto rounded-tl-2xl shadow-inner text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Outlet />
          </main>
        </div>
      </motion.div>
    </div>
  );
};