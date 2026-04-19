import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";

import { AuthProviderButtons } from "@/components/AuthProviderButtons";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long.")
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginValues>({
    defaultValues: {
      email: "",
      password: ""
    }
  });
  const params = new URLSearchParams(location.search);
  const redirectPath = params.get("redirect") ?? "/dashboard";

  const onSubmit = handleSubmit(async (values) => {
    setFormError("");
    setIsSubmitting(true);

    const parsed = loginSchema.safeParse(values);

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Enter valid login details.");
      setIsSubmitting(false);
      return;
    }

    try {
      await login(parsed.data.email, parsed.data.password);
      navigate(redirectPath);
    } catch (loginError) {
      setFormError(loginError instanceof Error ? loginError.message : "Invalid email or password.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  });

  return (
    <section className="mx-auto max-w-md rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Login</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          Sign in to HealthAI
        </h1>
        <p className="text-sm leading-6 text-slate-600">
          Access your saved reports, history, and detailed health summaries.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
          />
          {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register("password")}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
          />
          {errors.password ? <p className="text-sm text-red-600">{errors.password.message}</p> : null}
        </div>

        {formError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {formError}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-6">
        <AuthProviderButtons />
      </div>

      <p className="mt-6 text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-medium text-slate-950 underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    </section>
  );
}
