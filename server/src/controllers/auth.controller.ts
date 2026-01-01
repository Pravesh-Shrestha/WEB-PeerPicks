import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { signupDTO, loginDTO } from "../dtos/auth.dto";

const authService = new AuthService();

export class AuthController {
  async signup(req: Request, res: Response) {
    try {
      const validatedData = signupDTO.parse(req.body);
      const user = await authService.register(validatedData);
      res.status(201).json({ message: "Registration successful", user });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Signup failed" });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginDTO.parse(req.body);
      const result = await authService.login(validatedData);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message || "Login failed" });
    }
  }
}