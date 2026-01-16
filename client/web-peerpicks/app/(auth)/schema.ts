import { z } from "zod";

/**
 * Login Schema
 * Matches the validation requirements for existing users.
 */
export const loginSchema = z.object({
    email: z.string()
        .email({ message: "Enter a valid email" })
        .toLowerCase(), // Aligns with lowercase: true in user.model.ts
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" }), // Matches signup minimum
});

export type LoginData = z.infer<typeof loginSchema>;

/**
 * Signup Schema
 * Synchronized with user.model.ts and signupDTO.
 */
export const signupSchema = z.object({
    fullName: z.string()
        .min(2, { message: "Full name is required" }),
    gender: z.enum(["male", "female"], {
        message: "Please select a valid gender",
    }),
    dob: z.coerce.date().refine((date) => {
        const ageDifMs = Date.now() - date.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970) >= 13;
    }, { message: "You must be at least 13 years old" }),

    phone: z.string()
        .min(10, { message: "Enter a valid phone number" }),

    email: z.string()
        .email({ message: "Enter a valid email" })
        .toLowerCase(),

    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" }), // Updated to 8

    confirmPassword: z.string()
        .min(8, { message: "Minimum 8 characters" }),

    // Added profilePicture to match previous model updates
    profilePicture: z.string().optional(),
})
.refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export type SignupData = z.infer<typeof signupSchema>;