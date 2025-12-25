"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginData } from "../schema";
import Link from "next/link";
import { Mail, Lock, ChevronRight } from "lucide-react";

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginData) => {
    console.log("Login Data:", data);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
        <p className="text-slate-400 text-xs mt-2">
          New to PeerPicks? <Link href="/signup" className="text-indigo-400 font-semibold hover:underline">Create account</Link>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1">
          <div className="bg-white rounded-xl flex items-center px-4 h-[48px] focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            <input 
              {...register("email")} 
              placeholder="Email Address" 
              className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" 
            />
            <Mail size={16} className="text-slate-400" />
          </div>
          {errors.email && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase italic">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="bg-white rounded-xl flex items-center px-4 h-[48px] focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            <input 
              {...register("password")} 
              type="password" 
              placeholder="Password" 
              className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" 
            />
            <Lock size={16} className="text-slate-400" />
          </div>
          {errors.password && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase italic">{errors.password.message}</p>}
        </div>

        <div className="flex justify-end">
          <Link href="#" className="text-[10px] text-slate-500 hover:text-white transition-colors font-medium">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
          Log In <ChevronRight size={14} />
        </button>
      </form>

      {/* Social Icons Section (Matches Signup) */}
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