// SPDX-License-Identifier: MIT
// Copyright (c) 2025 AnyLLM

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Boxes, BookOpen, Settings, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GatewayStatus } from "../types";

interface PublicNavbarProps {
  status: GatewayStatus | null;
  onOpenSettings: () => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  status,
  onOpenSettings,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userDropdown, setUserDropdown] = React.useState(false);

  // Exact public nav items: Home, Models, Docs
  const publicNavItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/models", label: "Models", icon: Boxes },
    { path: "/docs", label: "Docs", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          <Link to="/" className="flex items-center space-x-2.5 cursor-pointer group flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-[2px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <span className="font-black text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-cyan-300 text-lg">
                  A
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Any<span className="text-emerald-400">LLM</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hidden sm:inline">
                Gateway
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {publicNavItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Status Badge */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300 flex-shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-slate-400">127.0.0.1:3000</span>
          </div>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition flex-shrink-0"
            title="Gateway Settings & BYOK Credentials"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Auth section */}
          {user ? (
            <div className="flex items-center space-x-2.5 flex-shrink-0">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition shadow-md shadow-emerald-950/20 whitespace-nowrap flex-shrink-0"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition text-sm flex-shrink-0"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    {user.name.slice(0, 1).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl text-xs space-y-2 z-50"
                    onClick={() => setUserDropdown(false)}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="font-bold text-white text-sm truncate">{user.name}</div>
                      <div className="text-slate-400 text-xs font-mono truncate">{user.email}</div>
                    </div>
                    <Link
                      to="/dashboard"
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                      <span>Dashboard Overview</span>
                    </Link>
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2.5 flex-shrink-0">
              <Link
                to="/login"
                className="whitespace-nowrap flex-shrink-0 px-4 py-2 min-w-[5rem] text-center rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-semibold border border-slate-800 transition shadow-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="whitespace-nowrap flex-shrink-0 px-4 py-2 min-w-[6.5rem] text-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold transition shadow-md shadow-emerald-950/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Links */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800/60 bg-[#090d16] px-2 py-2">
        {publicNavItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-1 px-3 text-xs whitespace-nowrap ${
                active ? "text-emerald-400 font-bold" : "text-slate-400"
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
