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

interface DashboardContextType {
  refreshTicket: number;
  unreadCount: number;
  triggerRefresh: () => void;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
  fetchUnreadCount: () => Promise<void>;
  // Protocol Compliance: "delete" [2026-02-01]
  handleDeleteSignal: (id: string, isUnread?: boolean) => Promise<void>;
  markAsRead: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [refreshTicket, setRefreshTicket] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTicket((prev) => prev + 1);
  }, []);

  /**
   * FIX: Axios interceptor already unwraps .data
   * We access 'res.count' directly.
   */
 const fetchUnreadCount = useCallback(async () => {
    try {
      // res is unwrapped: { success: true, count: X }
      const res: any = await axiosInstance.get(API.NOTIFICATIONS.UNREAD_COUNT);

      if (res && typeof res.count === "number") {
        setUnreadCount(res.count);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setUnreadCount(0); // Graceful reset on auth failure
      }
      console.error("[SIGNAL_SYNC_ERROR]: Node handshake failed.");
    }
  }, []);

  /**
   * PROTOCOL COMPLIANT: Delete logic [2026-02-01]
   * Added optimistic decrement for better UX.
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
      // Rollback if critical, though usually we just re-sync
      fetchUnreadCount();
    }
  };

const markAsRead = async () => {
  try {
    await axiosInstance.patch(API.NOTIFICATIONS.MARK_READ);
    setUnreadCount(0);
    triggerRefresh(); // Kick the ticket to update the feed page
    console.log("[PROTOCOL_SYNC]: All signals marked as read.");
  } catch (error) {
    console.error("SYNC_FAILURE:", error);
  }
};
  // Initial Sync
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return (
    <DashboardContext.Provider
      value={{
        refreshTicket,
        unreadCount,
        setUnreadCount,
        fetchUnreadCount,
        triggerRefresh,
        handleDeleteSignal,
        markAsRead

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
