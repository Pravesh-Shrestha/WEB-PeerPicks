import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongo: any;

beforeAll(async () => {
  // Ensure we aren't using a real DB by accident
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  
  // Close existing connections if any (important for watch mode)
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri);
});

afterEach(async () => {
  // Respect the skip flag for long integration tests
  if ((globalThis as any).__SKIP_DB_CLEANUP__) return;

  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
});