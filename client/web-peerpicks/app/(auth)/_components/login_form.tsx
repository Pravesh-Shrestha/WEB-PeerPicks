"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ChevronRight, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { handleLogin } from "@/lib/actions/auth-action";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginForm() {
  const {checkAuth} = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur"
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: LoginData) => {
    setMessage("");
    setIsSuccess(false);
    try {
      const result = await handleLogin(data);

      if (result?.success) {
        setIsSuccess(true);
        setMessage("Login successful! Redirecting...");

        // Refresh Auth Context
        await checkAuth();
        
        // Logic: Short delay before home
        //  redirect
        setTimeout(() => {
          router.push("/dashboard"); 
        }, 1500);
      } else {
        // Logic: Match Signup behavior by throwing error for catch block
        throw new Error(result?.message || "Invalid email or password");
      }
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-slate-400 text-[11px] mt-2">
          New to PeerPicks? <Link href="/signup" className="text-indigo-400 font-semibold hover:underline">Create account</Link>
        </p>
      </div>

      {/* Logic: Consistent Status Messaging */}
      {message && (
        <div className={`flex items-center gap-2 border p-3 rounded-xl mb-4 text-xs font-medium animate-in fade-in slide-in-from-top-1 ${
          isSuccess 
            ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
            : "bg-red-500/10 border-red-500/50 text-red-500"
        }`}>
          {isSuccess ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <fieldset disabled={isSubmitting || isSuccess} className="space-y-4">
          
          {/* Email Field */}
          <div className="relative">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${errors.email ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
              <input 
                {...register("email")} 
                placeholder="Email Address" 
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" 
              />
              <Mail size={16} className="text-slate-400" />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-2 uppercase italic">{errors.email.message}</p>}
          </div>

          {/* Password Field with Visibility Toggle Logic */}
          <div className="relative pt-1">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${errors.password ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
              <input 
                {...register("password")} 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" 
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              
              {/* Only show toggle when focused or has value */}
              {(passwordValue || passwordFocused) && (
                <button 
                  type="button" 
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="mr-2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
              <Lock size={16} className="text-slate-400" />
            </div>
            {errors.password && <p className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-2 uppercase italic">{errors.password.message}</p>}
          </div>
        </fieldset>

        <div className="flex justify-end mt-1">
          <Link href="#" className="text-[10px] text-slate-500 hover:text-white transition-colors font-medium">
            Forgot password?
          </Link>
        </div>

        <button 
          disabled={isSubmitting || isSuccess}
          type="submit" 
          className={`w-full text-white text-xs font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
            isSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSubmitting ? "Verifying..." : isSuccess ? "Success!" : "Log In"} 
          {!isSubmitting && !isSuccess && <ChevronRight size={14} />}
        </button>
      </form>

      {/* Social Icons Section */}
      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center">
        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em] mb-5">Quick login with</p>
        <div className="flex gap-8">
          <button type="button" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all">
            <span className="font-bold text-sm italic">G</span>
          </button>
          <button type="button" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all">
            <span className="font-bold text-sm italic">f</span>
          </button>
          <button type="button" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all">
            <span className="font-bold text-sm italic">A</span>
          </button>
        </div>
      </div>
    </div>
  );
}