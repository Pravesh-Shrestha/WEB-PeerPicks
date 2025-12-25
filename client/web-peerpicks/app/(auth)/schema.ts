import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(6, { message: "Minimum 6 characters" }),
});

export type LoginData = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
    fullName: z.string().min(2, { message: "Enter your full name" }),
    gender: z.string().refine(val => ["male", "female", "other"].includes(val), {
        message: "Select a gender",
    }),
    age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Enter a valid age",
    }),
    phone: z.string().min(10, { message: "Enter a valid phone number" }),
    email: z.string().email({ message: "Enter a valid email" }),
    password: z.string().min(6, { message: "Minimum 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Minimum 6 characters" }),
}).refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export type SignupData = z.infer<typeof signupSchema>;