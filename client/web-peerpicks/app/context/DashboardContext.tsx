"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axiosInstance from "@/lib/api/axios";
import { API } from "@/lib/api/endpoints";
import { useAuth } from "./AuthContext"; // Import Auth dependency

interface DashboardContextType {
  refreshTicket: number;
  unreadCount: number;
  triggerRefresh: () => void;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  fetchUnreadCount: () => Promise<void>;
  handleDeleteSignal: (id: string, isUnread?: boolean) => Promise<void>;
  markAsRead: () => Promise<void>;
  resetDashboard: () => void; // Added for Protocol Compliance
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth(); // Monitor auth state
  const [refreshTicket, setRefreshTicket] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTicket((prev) => prev + 1);
  }, []);

  const resetDashboard = useCallback(() => {
    setUnreadCount(0);
    setRefreshTicket(0);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    // Only fetch if we have an active identity handshake
    if (!isAuthenticated) return;

    try {
      const res: any = await axiosInstance.get(API.NOTIFICATIONS.UNREAD_COUNT);
      if (res && typeof res.count === "number") {
        setUnreadCount(res.count);
      }
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401 || status === 429) return;
      console.error("[SIGNAL_SYNC_ERROR]: Dashboard handshake failed.");
    }
  }, [isAuthenticated]);

  /**
   * PROTOCOL COMPLIANT: Delete logic [2026-02-01]
   */
  const handleDeleteSignal = async (id: string, isUnread: boolean = false) => {
    // 1. Optimistic Update
    if (isUnread) setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await axiosInstance.delete(API.NOTIFICATIONS.DELETE(id));
      console.log(`[PROTOCOL_ACTION]: Signal ${id} deleted.`);
      triggerRefresh();
    } catch (error) {
      console.error("DELETE_PROTOCOL_FAILURE:", error);
      fetchUnreadCount(); // Sync back on failure
    }
  };

  const markAsRead = async () => {
    try {
      await axiosInstance.patch(API.NOTIFICATIONS.MARK_READ);
      setUnreadCount(0);
      triggerRefresh();
      console.log("[PROTOCOL_SYNC]: All signals marked as read.");
    } catch (error) {
      console.error("SYNC_FAILURE:", error);
    }
  };

  // Auto-sync when authentication state changes or refresh is triggered
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    } else {
      resetDashboard();
    }
  }, [isAuthenticated, fetchUnreadCount, refreshTicket, resetDashboard]);

  return (
    <DashboardContext.Provider
      value={{
        refreshTicket,
        unreadCount,
        setUnreadCount,
        fetchUnreadCount,
        triggerRefresh,
        handleDeleteSignal,
        markAsRead,
        resetDashboard
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