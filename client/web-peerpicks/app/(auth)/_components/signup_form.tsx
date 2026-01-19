"use client";

import { handleRegister } from "@/lib/actions/auth-action";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { 
  User, Smartphone, Mail, Lock, Calendar, 
  ChevronDown, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 
} from "lucide-react";
import { signupSchema, SignupData } from "../schema";

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
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const passwordValue = watch("password");

const onSubmit = async (data: SignupData) => {
  setMessage("");
  setIsSuccess(false);

  try {
    const result = await handleRegister(data);

    // DEBUG: Look at your browser console to see what 'result' actually contains
    console.log("Signup Result:", result);

    if (result?.success) {
      setIsSuccess(true);
      setMessage("Account created successfully!");
      setTimeout(() => {
              router.push("/login");
            }, 2000);
      return;
    }

    setIsSuccess(false);
    setMessage(result?.message || "Registration failed. Please try again.");
  } catch (err: any) {
    console.error("Signup submit error:", err);
    setIsSuccess(false);
    setMessage(err?.message || "A network error occurred.");
  }
};

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Create account
        </h2>
        <p className="text-slate-400 text-[11px] mt-2">
          Join PeerPicks. Already a member?{" "}
          <Link
            href="/login"
            className="text-indigo-400 font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* 1. Ensure message exists before rendering */}
      {message && (
        <div
          className={`flex items-center gap-2 border p-3 rounded-xl mb-4 text-xs font-medium animate-in fade-in slide-in-from-top-1 ${
            /* 2. Logic: IF success is true, USE emerald (green). ELSE, USE red. */
            isSuccess
              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
              : "bg-red-500/10 border-red-500/50 text-red-500"
          }`}
        >
          {/* 3. Logic: Match the icon to the boolean */}
          {isSuccess ? (
            <CheckCircle2 size={14} className="shrink-0" />
          ) : (
            <AlertCircle size={14} className="shrink-0" />
          )}

          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <fieldset disabled={isSubmitting || isSuccess} className="space-y-3">
          {/* Full Name */}
          <div className="relative">
            <div
              className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${
                errors.fullName
                  ? "border-red-500"
                  : "border-transparent focus-within:border-indigo-500"
              }`}
            >
              <input
                {...register("fullName")}
                placeholder="Full Name"
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold"
              />
              <User size={16} className="text-slate-400" />
            </div>
            {errors.fullName && (
              <p className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-2 uppercase italic">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Gender & DOB Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <div
                className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${
                  errors.gender
                    ? "border-red-500"
                    : "border-transparent focus-within:border-indigo-500"
                }`}
              >
                <select
                  {...register("gender")}
                  className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold appearance-none"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <ChevronDown size={16} className="text-slate-400" />
              </div>
              {errors.gender && (
                <p className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-2 uppercase italic">
                  {errors.gender.message}
                </p>
              )}
            </div>

            <div className="relative">
              <div
                className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${
                  errors.dob
                    ? "border-red-500"
                    : "border-transparent focus-within:border-indigo-500"
                }`}
              >
                <input
                  {...register("dob")}
                  type="date"
                  className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold"
                />
                <Calendar size={16} className="text-slate-400" />
              </div>
              {errors.dob && (
                <p className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-2 uppercase italic">
                  {errors.dob.message}
                </p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="relative pt-1">
            <div
              className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${
                errors.phone
                  ? "border-red-500"
                  : "border-transparent focus-within:border-indigo-500"
              }`}
            >
              <input
                {...register("phone")}
                placeholder="Phone Number"
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold"
              />
              <Smartphone size={16} className="text-slate-400" />
            </div>
            {errors.phone && (
              <p className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-2 uppercase italic">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative pt-1">
            <div
              className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${
                errors.email
                  ? "border-red-500"
                  : "border-transparent focus-within:border-indigo-500"
              }`}
            >
              <input
                {...register("email")}
                placeholder="Email Address"
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold"
              />
              <Mail size={16} className="text-slate-400" />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-2 uppercase italic">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="relative pt-1">
            <div
              className={`bg-white rounded-xl flex items-center px-4 h-[48px] border-2 transition-all ${
                errors.password
                  ? "border-red-500"
                  : "border-transparent focus-within:border-indigo-500"
              }`}
            >
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-transparent text-slate-900 text-xs focus:outline-none font-semibold"
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              {(passwordValue || passwordFocused) && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="mr-2 text-slate-400 hover:text-indigo-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
              <Lock size={16} className="text-slate-400" />
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-500 font-bold absolute -bottom-4 left-2 uppercase italic">
                {errors.password.message}
              </p>
            )}
          </div>
        </fieldset>

        <button
          disabled={isSubmitting || isSuccess}
          type="submit"
          className={`w-full text-white text-xs font-bold py-4 rounded-xl transition-all active:scale-[0.98] mt-4 shadow-lg flex items-center justify-center gap-2 ${
            isSuccess ? "bg-emerald-600" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
          {isSubmitting
            ? "Creating Account..."
            : isSuccess
            ? "Success!"
            : "Sign Up"}
        </button>
      </form>
    </div>
  );
}