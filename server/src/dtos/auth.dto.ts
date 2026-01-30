import { z } from "zod";

/**
 * Signup DTO
 * Optimized for database consistency and Flutter compatibility.
 */
export const signupDTO = z.object({
  fullName: z
    .string()
    .min(2, "Full name is required")
    .trim(), // Removes accidental leading/trailing spaces

  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase() // Normalizes email for unique indexing
    .trim(),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),

  gender: z.enum(["male", "female"]),

  // Coerce ensures that if the web sends a string date, it's converted to a Date object
  dob: z.coerce.date().refine((date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    
    // Precise age calculation
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age >= 13;
  }, "You must be at least 13 years old"),

  phone: z
    .string()
    .min(10, "Valid phone number required")
    .regex(/^[0-9+]+$/, "Phone must contain only numbers and +"),

  profilePicture: z
    .string()
    .url("Invalid URL format")
    .optional()
    .nullable()
    .or(z.literal("")), // Handles empty strings from web forms


  role: z.enum(["user", "admin"]).default("user"),
});

/**
 * Login DTO
 */
export const loginDTO = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type SignupDTO = z.infer<typeof signupDTO>;
export type LoginDTO = z.infer<typeof loginDTO>;


export const updateUserDTO = signupDTO.partial().extend({
 role: z.enum(["user", "admin"]).optional(),
});

export type UpdateUserDTO = z.infer<typeof updateUserDTO>;