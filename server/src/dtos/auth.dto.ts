import { nullable, z } from "zod";

export const signupDTO = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gender: z.enum(["male", "female"], { error: "Gender is required" }),
  dob: z.coerce.date().refine(date => {
    const ageDifMs = Date.now() - date.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970) >= 13;
  }, "Must be at least 13 years old"),
  phone: z.string().min(10, "Valid phone number required"),
  profilePicture: z.string().optional().nullable(), // Add this line
});

export const loginDTO = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export type SignupDTO = z.infer<typeof signupDTO>;
export type LoginDTO = z.infer<typeof loginDTO>;