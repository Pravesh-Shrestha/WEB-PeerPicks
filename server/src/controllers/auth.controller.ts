import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { signupDTO, loginDTO } from "../dtos/auth.dto";

const authService = new AuthService();

export class AuthController {
// src/controllers/auth.controller.ts
async signup(req: Request, res: Response) {
  try {
    const validatedData = signupDTO.parse(req.body);
    const user = await authService.register(validatedData);
    res.status(201).json({ message: "Registration successful", user });
  } catch (error: any) {
    // ADD THIS LOG TO SEE ERRORS IN YOUR TERMINAL
    console.error("Validation Error Details:", error.errors); 
    
    res.status(400).json({ 
      success: false,
      error: error.errors || error.message 
    });
  }
}

  async login(req: Request, res: Response) {
    try {
      const validatedData = loginDTO.parse(req.body);
      const result = await authService.login(validatedData);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Validation Error Details:", error.errors); 
      console.log("Login Error:", error.errors);
      res.status(401).json({ error: error.message || "Login failed" });
    }
  }
}