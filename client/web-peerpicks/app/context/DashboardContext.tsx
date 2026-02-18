"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface DashboardContextType {
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const triggerRefresh = useCallback(() => setRefreshKey(prev => prev + 1), []);

  return (
    <DashboardContext.Provider value={{ isModalOpen, openModal, closeModal, refreshKey, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
};