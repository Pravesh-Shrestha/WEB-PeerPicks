import { Server } from "socket.io";

let io: Server;

export const socketGateway = {
  init: (httpServer: any) => {
    io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      const userId = socket.handshake.query.userId;
      
      if (userId) {
        socket.join(userId.toString());
        console.log(`📡 SIGNAL CONNECTED: Node ${userId}`);
      }

      socket.on("disconnect", () => {
        console.log("📡 SIGNAL LOST: Node disconnected");
      });
    });

    return io;
  },

  // Method to send notification to a specific user
  sendNotification: (recipientId: string, data: any) => {
    if (io) {
      io.to(recipientId).emit("NEW_NOTIFICATION", data);
    }
  }
};