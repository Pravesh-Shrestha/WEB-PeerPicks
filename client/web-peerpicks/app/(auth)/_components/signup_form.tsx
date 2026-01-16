"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupData } from "../schema";
import Link from "next/link";
import { handleRegister } from "@/lib/actions/auth-action";
import { User, Smartphone, Mail, Lock, Calendar, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupData>({
    mode: "onBlur"
  });
  
  const router = useRouter();
  const [error, setError] = useState("");

  const onSubmit = async (data: SignupData) => {
    setError("");
    try {
      const result = await handleRegister(data);
      
      if (result?.success) {
        // Redirect on success
        router.push("/login");
      } else {
        // Set error message from server if registration failed
        setError(result?.message || "Something went wrong. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">Create account</h2>
        <p className="text-slate-400 text-[11px] mt-1">
          Join PeerPicks. Already a member? <Link href="/login" className="text-indigo-400 font-semibold hover:underline">Log in</Link>
        </p>
      </div>

      {/* Display General Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        {/* Full Name */}
        <div className="relative">
          <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 transition-all ${errors.fullName ? 'border-red-500' : 'border-transparent'}`}>
            <input {...register("fullName")} placeholder="Full Name" className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" />
            <User size={14} className="text-slate-400" />
          </div>
          {errors.fullName && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.fullName.message}</span>}
        </div>

        {/* Gender & Date of Birth Row */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="relative">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 ${errors.gender ? 'border-red-500' : 'border-transparent'}`}>
              <select {...register("gender")} className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold appearance-none">
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <ChevronDown size={14} className="text-slate-400" />
            </div>
            {errors.gender && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.gender.message}</span>}
          </div>

          <div className="relative">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 ${errors.dob ? 'border-red-500' : 'border-transparent'}`}>
              <input {...register("dob")} type="date" className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" />
              <Calendar size={14} className="text-slate-400" />
            </div>
            {errors.dob && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.dob.message}</span>}
          </div>
        </div>

        {/* Phone */}
        <div className="relative pt-1">
          <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 ${errors.phone ? 'border-red-500' : 'border-transparent'}`}>
            <input {...register("phone")} placeholder="Phone" className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" />
            <Smartphone size={14} className="text-slate-400" />
          </div>
          {errors.phone && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.phone.message}</span>}
        </div>

        {/* Email */}
        <div className="relative pt-1">
          <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 ${errors.email ? 'border-red-500' : 'border-transparent'}`}>
            <input {...register("email")} placeholder="Email" className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" />
            <Mail size={14} className="text-slate-400" />
          </div>
          {errors.email && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.email.message}</span>}
        </div>

        {/* Password */}
        <div className="relative pt-1">
          <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 ${errors.password ? 'border-red-500' : 'border-transparent'}`}>
            <input {...register("password")} type="password" placeholder="Password" className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" />
            <Lock size={14} className="text-slate-400" />
          </div>
          {errors.password && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.password.message}</span>}
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-4 shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? "Creating Account..." : "Sign Up"}
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