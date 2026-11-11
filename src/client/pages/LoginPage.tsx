// SPDX-License-Identifier: MIT
// Copyright (c) 2025 AnyLLM

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, AlertCircle, ShieldCheck, ArrowLeft, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export const LoginPage: React.FC = () => {
  const { user, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleInfo, setGoogleInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  React.useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res.requiresEnv) {
        setGoogleInfo(
          "Google OAuth requires GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET in your server environment (Callback: http://127.0.0.1:3000/v1/auth/callback/google)."
        );
      } else if (!res.url) {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDevGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle("developer@google.com", "Google Developer");
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed dev sign-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl space-y-6">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 items-center justify-center text-slate-950 font-black text-xl mb-1 shadow-lg shadow-emerald-500/20">
            A
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to <span className="text-emerald-400">AnyLLM</span>
          </h1>
          <p className="text-xs text-slate-400">
            Access your developer console, custom API keys, and routing analytics.
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-700/80 text-slate-200 font-semibold text-sm transition shadow-sm hover:border-slate-600 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="whitespace-nowrap">Continue with Google</span>
          </button>

          {googleInfo && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs space-y-2">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{googleInfo}</p>
              </div>
              <button
                type="button"
                onClick={handleDevGoogleLogin}
                className="w-full py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs transition"
              >
                Sign in with Local Google Profile (Dev)
              </button>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-xs uppercase font-bold tracking-wider text-slate-500">
              or with email
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@domain.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-950/40 disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? "Signing in..." : "Sign In to Dashboard"}
          </button>
        </form>

        {/* Footer switch */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Don't have an account yet?{" "}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1">
            Create an Account
          </Link>
        </div>

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local database storage • Private self-hosted sessions</span>
        </div>
      </div>
    </div>
  );
};
