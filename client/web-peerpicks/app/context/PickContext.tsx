"use client";

import React, { createContext, useContext, useState, useTransition } from "react";
import { handleAdminDeletePick } from "@/lib/actions/pick-action";

interface PickContextType {
  picks: any[];
  setPicks: React.Dispatch<React.SetStateAction<any[]>>;
  deletePick: (id: string) => Promise<boolean>;
  isPending: boolean;
}

const PickContext = createContext<PickContextType | undefined>(undefined);

export const PickProvider = ({ 
  children, 
  initialPicks = []   // 👈 default value
}: { 
  children: React.ReactNode; 
  initialPicks?: any[] 
}) => {
  const [picks, setPicks] = useState<any[]>(initialPicks ?? []);
  const [isPending, startTransition] = useTransition();

  // Optimized Delete Protocol [2026-02-01]
  const deletePick = async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const res = await handleAdminDeletePick(id);
        if (res.success) {
          setPicks((prev) => prev.filter((p) => p._id !== id));
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  };

  return (
    <PickContext.Provider value={{ picks, setPicks, deletePick, isPending }}>
      {children}
    </PickContext.Provider>
  );
};

export const usePicks = () => {
  const context = useContext(PickContext);
  if (!context) throw new Error("usePicks must be used within PickProvider");
  return context;
};