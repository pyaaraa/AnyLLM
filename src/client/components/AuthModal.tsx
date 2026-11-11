// SPDX-License-Identifier: MIT
// Copyright (c) 2025 AnyLLM

import React, { useState, useEffect } from "react";
import { LogIn, UserPlus, X, ShieldCheck, AlertCircle, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = "signin",
}) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(initialTab);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleInfo, setGoogleInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync tab with initialTab whenever modal opens or initialTab changes
  useEffect(() => {
    setTab(initialTab);
    setError(null);
    setGoogleInfo(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setGoogleInfo(null);
    setLoading(true);
    try {
      if (tab === "signup") {
        if (!name.trim()) throw new Error("Full Name is required");
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Authentication failed");
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
        onClose();
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
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed dev sign-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 items-center justify-center text-slate-950 font-black text-xl mb-3 shadow-lg shadow-emerald-500/20">
            A
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-emerald-400">AnyLLM</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Universal AI Gateway & Intelligent Router
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mb-5 space-y-3">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-700/90 text-slate-200 font-semibold text-sm transition shadow-sm hover:border-slate-600 disabled:opacity-50"
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
            <span>Continue with Google</span>
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
              or continue with email
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setTab("signin");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
              tab === "signin"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signup");
              setError(null);
            }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition ${
              tab === "signup"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Developer"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          )}

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
            className="w-full py-3.5 mt-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition shadow-lg shadow-emerald-950/40 disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : tab === "signin"
              ? "Sign In to AnyLLM"
              : "Create Developer Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local database storage • Private credentials</span>
        </div>
      </div>
    </div>
  );
};
