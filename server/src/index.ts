import http from "http";
import app from './app';
import { connectDB } from './database/database.db';
import { PORT } from './config/index'; 
import { socketGateway } from './gateways/socket.gateway';

async function startServer() {
  try {
    // 1. Establish Database Connection
    await connectDB();

    // 2. Wrap the Express app in a Node HTTP Server
    // This is required for Socket.io to function correctly
    const server = http.createServer(app);

    // 3. Initialize the Socket Gateway
    // This attaches the WebSocket engine to your HTTP server
    socketGateway.init(server);

    // 4. Listen using the 'server' instance instead of 'app'
    server.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`\n✅ PeerPicks Core System Active!`);
      console.log(`📡 Local:   http://localhost:${PORT}`);
      console.log(`🌐 Network: http://0.0.0.0:${PORT} (Mobile/Flutter Handshake Ready)`);
      console.log(`🔌 Sockets: WebSocket Gateway initialized and listening`);
    });

  } catch (error) {
    console.error("❌ CRITICAL SYSTEM FAILURE:", error);
    process.exit(1);
  }
}

startServer();