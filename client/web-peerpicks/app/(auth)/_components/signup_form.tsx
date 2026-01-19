"use client";

import { handleRegister } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { 
  User, Smartphone, Mail, Lock, Calendar, 
  ChevronDown, Eye, EyeOff, CheckCircle2, AlertCircle 
} from "lucide-react";
import { signupSchema } from "../schema"; // Ensure this matches RegisterFormValues

type SignupData = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur"
  });

  // Watch password value to toggle the visibility icon (as per your requested logic)
  const passwordValue = watch("password");

  const onSubmit = async (data: SignupData) => {

    setMessage("");
    setIsSuccess(false);
    try {

      const result = await handleRegister(data);
      if (result.success) {
        setIsSuccess(true);
        setMessage("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        throw new Error(result.message || "Registration failed");
      }
    } catch (err: any) {
      setIsSuccess(false);
      setMessage(err.message || "Registration failed");
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

      {/* Logic: Displaying Error or Success Messages */}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        <fieldset disabled={isSubmitting || isSuccess} className="space-y-2.5">
          
          {/* Full Name */}
          <div className="relative">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 transition-all ${errors.fullName ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
              <input {...register("fullName")} placeholder="Full Name" className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" />
              <User size={14} className="text-slate-400" />
            </div>
            {errors.fullName && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.fullName.message}</span>}
          </div>

          {/* Gender & DOB Row */}
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

          {/* Phone Number */}
          <div className="relative pt-1">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 ${errors.phone ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
              <input {...register("phone")} placeholder="Phone Number" className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" />
              <Smartphone size={14} className="text-slate-400" />
            </div>
            {errors.phone && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.phone.message}</span>}
          </div>

          {/* Email */}
          <div className="relative pt-1">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 ${errors.email ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
              <input {...register("email")} placeholder="Email Address" className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" />
              <Mail size={14} className="text-slate-400" />
            </div>
            {errors.email && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.email.message}</span>}
          </div>

          {/* Password with your Logic (only show icon when focused or has value) */}
          <div className="relative pt-1">
            <div className={`bg-white rounded-xl flex items-center px-4 h-[40px] border-2 ${errors.password ? 'border-red-500' : 'border-transparent focus-within:border-indigo-500'}`}>
              <input 
                {...register("password")} 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold" 
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              
              {/* Logic: Visibility toggle only appears if focused or has content */}
              {(passwordValue || passwordFocused) && (
                <button 
                  type="button" 
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="mr-2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              )}
              <Lock size={14} className="text-slate-400" />
            </div>
            {errors.password && <span className="text-[9px] text-red-400 font-bold absolute -bottom-3.5 left-2 uppercase italic">{errors.password.message}</span>}
          </div>
        </fieldset>

        <button 
          disabled={isSubmitting || isSuccess}
          type="submit" 
          className={`w-full text-white text-xs font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] mt-4 shadow-lg disabled:opacity-50 ${
            isSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSubmitting ? "Creating Account..." : isSuccess ? "Success! Redirecting..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
}