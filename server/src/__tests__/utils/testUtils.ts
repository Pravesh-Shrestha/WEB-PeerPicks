import request from "supertest";
import app from "../../app"; // Your Express app instance

import bcrypt from "bcryptjs";
import { UserModel } from "models/user.model";

export const createUser = async (role = "user") => {
  const hashed = await bcrypt.hash("password123", 10);

  return await UserModel.create({
    email: `${Date.now()}@test.com`,
    password: hashed,
    fullName: "Test User",
    role,
  });
};

export const loginUser = async (email: string) => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email,
      password: "password123",
    });

  return res.headers["set-cookie"];
};

export const createAndLogin = async (role = "user") => {
  const user = await createUser(role);
  const cookies = await loginUser(user.email);
  return { user, cookies };
};