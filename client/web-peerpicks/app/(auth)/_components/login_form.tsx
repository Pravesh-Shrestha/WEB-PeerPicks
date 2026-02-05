"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ChevronRight, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { handleLogin } from "@/lib/actions/auth-action";
import { useAuth } from "@/app/context/AuthContext";

export default function LoginForm() {
  const { checkAuth } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 1. REDIRECT LOGIC: Check for token/cookie on mount
  useEffect(() => {
    const hasToken = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (hasToken) {
      router.push("/dashboard");
    }
  }, [router]);

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched"
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
        
        await checkAuth(); // Refresh Auth Context
        
        setTimeout(() => {
          router.push("/dashboard"); 
        }, 1500);
      } else {
        throw new Error(result?.message || "Invalid email or password");
      }
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-slate-400 text-[11px] mt-2">
          New to PeerPicks? <Link href="/signup" className="text-indigo-400 font-semibold hover:underline">Create account</Link>
        </p>
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
        <fieldset disabled={isSubmitting || isSuccess} className="space-y-5">
          
          {/* Email Field */}
          <div className="space-y-1">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${errors.email ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
              <input 
                {...register("email")} 
                placeholder="Email Address" 
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" 
              />
              <Mail size={16} className="text-slate-400" />
            </div>
            {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase px-2">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${errors.password ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
              <input 
                {...register("password")} 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" 
              />
              {passwordValue && (
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
            {errors.password && <p className="text-[10px] text-red-500 font-bold uppercase px-2">{errors.password.message}</p>}
          </div>
        </fieldset>

        <div className="flex justify-end">
          <Link href="/forget_password" className="text-[10px] text-slate-500 hover:text-white transition-colors font-medium">
            Forgot password?
          </Link>
        </div>

        <button 
          disabled={isSubmitting || isSuccess}
          type="submit" 
          className={`w-full text-white text-xs font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 ${
            isSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Verifying...
            </>
          ) : isSuccess ? (
            "Success!"
          ) : (
            <>
              Log In <ChevronRight size={14} />
            </>
          )} 
        </button>
      </form>

      {/* Social Icons Section */}
      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center">
        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-[0.2em] mb-5">Quick login with</p>
        <div className="flex gap-8">
          {['G', 'f', 'A'].map((icon) => (
            <button key={icon} type="button" className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-indigo-600/20 hover:border-indigo-500/50 transition-all">
              <span className="font-bold text-sm italic">{icon}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}