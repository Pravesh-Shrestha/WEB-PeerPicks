"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

interface DashboardContextType {
  refreshTicket: number;
  triggerRefresh: () => void;
  // Updated naming convention: delete instead of purge
  handleDeleteSignal: (id: string) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [refreshTicket, setRefreshTicket] = useState(0);

  // Increments to trigger useEffects in Discover/Home grids
  const triggerRefresh = useCallback(() => {
    setRefreshTicket((prev) => prev + 1);
  }, []);

  const handleDeleteSignal = async (id: string) => {
    try {
      // Mock API call for deletion
      // await deletePickAction(id); 
      console.log(`Action: Signal ${id} has been deleted.`);
      triggerRefresh(); 
    } catch (error) {
      console.error("Delete operation failed:", error);
    }
  };

  return (
    <DashboardContext.Provider 
      value={{ 
        refreshTicket, 
        triggerRefresh, 
        handleDeleteSignal 
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};