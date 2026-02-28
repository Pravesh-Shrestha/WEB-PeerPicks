import app from './app';
import { connectDB } from './database/database.db';
import { PORT, ALLOWED_ORIGINS } from './config/index'; 

async function startServer() {
  await connectDB();
  app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n✅ PeerPicks Server is ready!`);
  console.log(`📡 Local:   ${PORT}`);
  console.log(`🌐 Network: ${PORT} (Use this for Mobile/Flutter)`);
});
}
startServer();