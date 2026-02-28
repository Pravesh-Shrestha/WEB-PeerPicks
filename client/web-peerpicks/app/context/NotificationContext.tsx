// context/NotificationContext.tsx
"use client";

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext
import { API } from '@/lib/api/endpoints';

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth(); // Only connect if user is logged in

  useEffect(() => {
    // 1. Logic Guard: Don't attempt connection if no user node identity exists
    if (!user?._id) return;

    // 1. Optional token support for EventSource auth fallback
    const token = localStorage.getItem('auth_token');

    // 2. Build stream URL (token query only when valid)
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    const streamUrl = hasValidToken
      ? `${API.NOTIFICATIONS.STREAM}?token=${encodeURIComponent(token)}`
      : API.NOTIFICATIONS.STREAM;

    // 2. Point to the backend route (matches notification.route.ts)
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || ''}${streamUrl}`, {
      withCredentials: true 
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // 3. Handshake Check: Ignore the initial "SIGNAL_LINK_ESTABLISHED" message
        if (data.type === 'SYSTEM') {
          console.log("PeerPicks Node Connection:", data.message);
          return;
        }

        // 4. Signal Reporting: Trigger the toast for social interactions
        // We use the actorName fixed in the notificationService
        toast.info(data.message, {
          description: `${data.actorName || 'Someone'} interacted with your post.`,
          action: {
            label: "View",
            onClick: () => {
              const pickId = data?.pickId?._id || data?.pickId;
              if (pickId) {
                window.location.href = `/dashboard/picks/${pickId}`;
              }
            }
          },
        });

      } catch (error) {
        console.error("PROTOCOL_ERROR: Failed to parse incoming signal", error);
      }
    };

    eventSource.onerror = (err) => {
      // Browsers handle auto-reconnect for SSE, but we log for debugging
      console.warn("Signal Node disconnected. Re-establishing link...");
    };

    // 5. Cleanup: Close stream on logout or unmount to prevent memory leaks
    return () => {
      eventSource.close();
    };
  }, [user?._id]); // Re-run if user changes

  return <>{children}</>;
};