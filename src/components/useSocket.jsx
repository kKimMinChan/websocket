import { useEffect } from "react";
import { io } from "socket.io-client";

export const useSocket = (serverUrl) => {
  const socket = io(serverUrl);

  useEffect(() => {
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
};
