import Cookies from "js-cookie";
import { io } from "socket.io-client";

const SOCKET_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");

let socketInstance = null;

export const getSocket = () => {
  const token = Cookies.get("auth_token");
  if (!token) {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
      auth: { token },
    });
  } else {
    socketInstance.auth = { token };
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
};

export const disconnectSocket = () => {
  if (!socketInstance) {
    return;
  }

  socketInstance.disconnect();
  socketInstance = null;
};

export default {
  getSocket,
  disconnectSocket,
};
