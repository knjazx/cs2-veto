/**
 * useSocket — manages the Socket.io connection lifecycle.
 *
 * Returns { socket, connected }
 * The socket instance is created once and reused across re-renders.
 */
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:8000"; // proxied by Vite in dev

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create socket only once
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        autoConnect: true,
      });
    }

    const socket = socketRef.current;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      // Do NOT disconnect here — socket is reused across routes
    };
  }, []);

  return { socket: socketRef.current, connected };
}
