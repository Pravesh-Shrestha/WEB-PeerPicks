// components/shared/SignalListener.tsx
"use client";

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useDashboard } from '@/app/context/DashboardContext';
import { API } from '@/lib/api/endpoints';

export default function SignalListener() {
  const { triggerRefresh } = useDashboard();

  useEffect(() => {
    // 1. Establish the connection to the route we created in the controller
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    const useBase = apiBase && apiBase !== 'undefined' && apiBase !== 'null' ? apiBase : '';
    const eventSource = new EventSource(`${useBase}${API.NOTIFICATIONS.STREAM}`, {
      withCredentials: true 
    });

    eventSource.onmessage = (event) => {
      const signal = JSON.parse(event.data);
      
      // 2. Ignore the initial SYSTEM link established message
      if (signal.type === 'SYSTEM') return;

      // 3. Trigger a local state refresh so the NotificationsPage updates instantly
      triggerRefresh();

      // 4. Show the specific toast string requested
      // Example: "Nick upvoted your pick."
      toast.success(`${signal.actorName} ${signal.message}`, {
        icon: "📡",
        style: { background: '#000', border: '1px solid #D4FF33', color: '#fff' }
      });
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [triggerRefresh]);

  return null;
}