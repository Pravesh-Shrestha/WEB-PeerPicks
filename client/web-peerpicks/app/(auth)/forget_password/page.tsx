"use client";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/api/auth";
import { motion } from "framer-motion";
import { Mail, ChevronLeft, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export const RequestPasswordResetSchema = z.object({
    email: z.string().email("Please enter a valid email address.")
});

export type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>;

export default function RequestResetPage() {
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(0); // Timer state

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } 
    } = useForm<RequestPasswordResetDTO>({
        resolver: zodResolver(RequestPasswordResetSchema),
        mode: "onTouched"
    });

    // Handle the 15-second countdown logic
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const onSubmit = async (data: RequestPasswordResetDTO) => {
        setMessage("");
        try {
            const response = await requestPasswordReset(data.email);
            if (response.success) {
                setIsSuccess(true);
                setMessage('Check your inbox for the reset link.');
                setCountdown(15); // Start 15s cooldown on success
            } else {
                throw new Error(response.message || 'Verification failed.');
            }
        } catch (error: any) {
            setIsSuccess(false);
            setMessage(error.message || 'An unexpected error occurred');
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl"
            >
                <Link href="/login" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 text-[11px] font-medium">
                    <ChevronLeft size={14} /> Back to Login
                </Link>

                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-white tracking-tight italic">Reset Password</h1>
                    <p className="text-slate-400 text-[11px] mt-2 font-medium uppercase tracking-wider">Access Recovery Protocol</p>
                </div>

                {message && (
                    <div className={`flex items-center gap-2 border p-3 rounded-xl mb-6 text-xs font-medium animate-in fade-in slide-in-from-top-2 ${
                        isSuccess 
                            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                            : "bg-red-500/10 border-red-500/50 text-red-500"
                    }`}>
                        {isSuccess ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Logic change: We only disable the fieldset if it's currently submitting.
                        We allow editing the email if they want to resend to a different one.
                    */}
                    <fieldset disabled={isSubmitting} className="space-y-5">
                        <div className="space-y-1">
                            {/* Theme update: changed bg-white to dark to match your refined design */}
                            <div className={`bg-[#0F0F12] rounded-xl flex items-center px-4 h-[52px] border transition-all ${
                                errors.email 
                                    ? 'border-red-500/50' 
                                    : 'border-white/10 focus-within:border-indigo-500/50'
                            }`}>
                                <input 
                                    {...register("email")} 
                                    type="email"
                                    placeholder="Registered Email Address" 
                                    className="w-full bg-transparent text-white text-xs focus:outline-none font-medium" 
                                />
                                <Mail size={16} className="text-slate-600" />
                            </div>
                            {errors.email && (
                                <p className="text-[10px] text-red-500 font-bold uppercase px-2">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>
                    </fieldset>

                    <button 
                        // Button is disabled during submission OR during the 15s cooldown
                        disabled={isSubmitting || countdown > 0}
                        type="submit" 
                        className={`w-full text-white text-[11px] font-bold uppercase tracking-widest py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
                            countdown > 0
                                ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5"
                                : isSuccess 
                                    ? "bg-emerald-600 hover:bg-emerald-700" 
                                    : "bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Synchronizing...
                            </>
                        ) : countdown > 0 ? (
                            <>
                                <RefreshCw size={14} className="animate-spin-slow" />
                                Resend in {countdown}s
                            </>
                        ) : isSuccess ? (
                            "Resend Reset Link"
                        ) : (
                            "Send Reset Link"
                        )} 
                    </button>
                </form>
            </motion.div>
        </div>
    );
}