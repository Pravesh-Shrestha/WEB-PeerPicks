"use client";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldAlert, Fingerprint } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const ResetPasswordSchema = z.object({
    password: z.string().min(8, "Security protocol requires 8+ characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Credentials do not match",
    path: ["confirmPassword"]
});

export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm({ token }: { token: string }) {
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetPasswordData>({
        resolver: zodResolver(ResetPasswordSchema),
        mode: "onChange"
    });

    const router = useRouter();
    const passwordValue = watch("password");
    const confirmPasswordValue = watch("confirmPassword");

    const onSubmit = async (data: ResetPasswordData) => {
        setMessage("");
        setIsSuccess(false);
        const response = await handleResetPassword(token, data.password);
        
        if (response.success) {
            setIsSuccess(true);
            setMessage(response.message);
            toast.success("Security keys synchronized");
            setTimeout(() => router.replace('/login'), 2000);
        } else {
            setMessage(response.message);
            toast.error(response.message);
        }
    };

    return (
        <div className="w-full max-w-[380px] mx-auto px-6 py-10">
            {/* Minimalist Header */}
            <div className="relative mb-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                    <Fingerprint className="text-indigo-500" size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight italic">Security Update</h2>
                <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-2 font-medium">
                    Authentication Protocol v2.6
                </p>
            </div>

            {/* Status Message with Motion */}
            <AnimatePresence mode="wait">
                {message && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-center gap-3 border p-3 rounded-xl mb-8 text-[10px] font-bold uppercase tracking-wider shadow-2xl ${
                            isSuccess 
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5" 
                                : "bg-red-500/5 border-red-500/20 text-red-500 shadow-red-500/5"
                        }`}
                    >
                        {isSuccess ? <CheckCircle2 size={14} className="animate-pulse" /> : <ShieldAlert size={14} />}
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    {/* Password Field */}
                    <div className="group space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">
                                New Access Key
                            </label>
                            {errors.password && <span className="text-[9px] text-red-500 font-bold uppercase">Invalid</span>}
                        </div>
                        <div className={`relative flex items-center bg-[#0F0F12] rounded-xl border transition-all duration-300 ${
                            errors.password ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'border-white/[0.03] group-focus-within:border-indigo-500/40 group-focus-within:bg-[#121217]'
                        }`}>
                            <div className="pl-4 text-slate-600">
                                <Lock size={16} strokeWidth={2.5} />
                            </div>
                            <input 
                                {...register("password")} 
                                type={showPassword ? "text" : "password"} 
                                placeholder="••••••••••••" 
                                className="w-full bg-transparent text-white text-sm h-[52px] px-3 focus:outline-none placeholder:text-slate-800 tracking-widest font-mono" 
                            />
                            {passwordValue && (
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="pr-4 text-slate-600 hover:text-indigo-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="group space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-focus-within:text-indigo-400 transition-colors">
                                Verify Access Key
                            </label>
                            {errors.confirmPassword && <span className="text-[9px] text-red-500 font-bold uppercase">Mismatch</span>}
                        </div>
                        <div className={`relative flex items-center bg-[#0F0F12] rounded-xl border transition-all duration-300 ${
                            errors.confirmPassword ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.05)]' : 'border-white/[0.03] group-focus-within:border-indigo-500/40 group-focus-within:bg-[#121217]'
                        }`}>
                            <div className="pl-4 text-slate-600">
                                <Lock size={16} strokeWidth={2.5} />
                            </div>
                            <input 
                                {...register("confirmPassword")} 
                                type={showConfirmPassword ? "text" : "password"} 
                                placeholder="••••••••••••" 
                                className="w-full bg-transparent text-white text-sm h-[52px] px-3 focus:outline-none placeholder:text-slate-800 tracking-widest font-mono" 
                            />
                            {confirmPasswordValue && (
                                <button 
                                    type="button" 
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="pr-4 text-slate-600 hover:text-indigo-400 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <button 
                    disabled={isSubmitting || isSuccess}
                    type="submit" 
                    className={`relative w-full h-[54px] rounded-xl font-bold text-[11px] uppercase tracking-[0.15em] transition-all duration-300 active:scale-[0.97] overflow-hidden group ${
                        isSuccess 
                            ? "bg-emerald-500 text-white" 
                            : "bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
                    }`}
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Syncing Protocol...
                            </>
                        ) : isSuccess ? (
                            "Protocol Updated"
                        ) : (
                            "Update Credentials"
                        )}
                    </span>
                    {/* Glossy Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </form>
        </div>
    );
}