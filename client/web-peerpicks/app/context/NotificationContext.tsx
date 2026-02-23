// context/NotificationContext.tsx
"use client";
import { useEffect } from 'react';
import { toast } from 'sonner';

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // 1. Point this to your backend route established above
    const eventSource = new EventSource('/api/notifications/stream', {
      withCredentials: true // Crucial for passing your Auth cookies
    });

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // 2. This is where the "upvoted/commented/save" signals arrive!
      if (data.type !== 'SYSTEM') {
        toast.success(`${data.actorName} ${data.message}`);
      }
    };

    return () => eventSource.close(); // Cleanup on logout
  }, []);

  return <>{children}</>;
};