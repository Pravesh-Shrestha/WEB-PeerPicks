import z from "zod";

export const userSchema = z.object({
    fullName: z.string()
        .min(2, { message: "Full name is required" }),

    gender: z.enum(["male", "female"], {
        message: "Please select a valid gender",
    }),
    dob: z.string()
    .min(1, { message: "Date of birth is required" })
    .refine((dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return false;
        
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            return age - 1 >= 13;
        }
        return age >= 13;
    }, { message: "You must be at least 13 years old" }),

    phone: z.string()
        .min(10, { message: "Enter a valid phone number" }),

    email: z.string()
        .email({ message: "Enter a valid email" })
        .toLowerCase(), // Ensures unique index consistency in MongoDB

    password: z.string()
        .min(8, { message: "Password must be at least 8 characters" }), // Updated to 

    // Added profilePicture to match previous model updates
    profilePicture: z.string().optional(),
});

export type UserData = z.infer<typeof userSchema>;