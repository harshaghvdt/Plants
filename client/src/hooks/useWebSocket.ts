import { useEffect, useRef, useCallback } from "react";
import { queryClient } from "@/lib/queryClient";

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case "new_tweet":
            // Invalidate timeline queries to refresh the feed
            queryClient.invalidateQueries({ queryKey: ["/api/tweets/timeline"] });
            break;
          case "tweet_liked":
          case "tweet_unliked":
          case "tweet_retweeted":
          case "tweet_unretweeted":
            // Invalidate timeline to update counts
            queryClient.invalidateQueries({ queryKey: ["/api/tweets/timeline"] });
            break;
          case "user_followed":
          case "user_unfollowed":
            // Invalidate user suggestions
            queryClient.invalidateQueries({ queryKey: ["/api/users/suggestions"] });
            break;
          default:
            console.log("Unknown message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket disconnected");
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    isConnected: ws.current?.readyState === WebSocket.OPEN,
    reconnect: connect,
  };
}
