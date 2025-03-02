
import { Server } from "socket.io";
import { logoutSocketId, registerSocket } from "./service/auth.service.js";

export const runIo = (httpServer) => {
  const io = new Server(httpServer, { cors: "*" });



  return io.on("connection", async (socket) => {
    await registerSocket(socket);

    await logoutSocketId(socket);
  });
};
