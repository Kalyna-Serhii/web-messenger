import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = () => {
    socket = io("http://localhost:8080", {
        transports: ["websocket"],
        withCredentials: true,
    });
};

export const getSocket = (): Socket | null => {
    return socket;
};
