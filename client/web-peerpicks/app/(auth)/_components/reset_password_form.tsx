"use client";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export const ResetPasswordSchema = z.object({
    password: z.string().min(8, "Minimum 8 characters required"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Keys do not match",
    path: ["confirmPassword"]
});

export default function ResetPasswordForm({ token }: { token: string }) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(ResetPasswordSchema)
    });
    const router = useRouter();

    const onSubmit = async (data: any) => {
        try {
            const response = await handleResetPassword(token, data.password);
            if (response.success) {
                toast.success("Identity updated successfully");
                router.replace('/login');
            } else {
                toast.error(response.message || "Failed to reset password");
            }
        } catch (error) {
            toast.error("An unexpected system error occurred");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input 
                {...register("password")} 
                type="password" 
                placeholder="New Password" 
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password.message as string}</p>}
            
            <input 
                {...register("confirmPassword")} 
                type="password" 
                placeholder="Confirm Password" 
                className="w-full border p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message as string}</p>}

            <button 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 shadow-lg shadow-blue-500/20"
            >
                {isSubmitting ? "Syncing..." : "Update Password"}
            </button>
        </form>
    );
}