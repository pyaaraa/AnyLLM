import React, { useState } from "react";
import { Home, Sparkles, MessageSquareText, Boxes, LayoutDashboard, KeyRound, Cpu, BookOpen, Settings, User as UserIcon, LogOut, ChevronDown, Shield, Zap, } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { GatewayStatus } from "../types";
interface NavbarProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    status: GatewayStatus | null;
    onOpenSettings: () => void;
    onOpenAuth: (tab?: "signin" | "signup") => void;
}
export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, status, onOpenSettings, onOpenAuth, }) => {
    const { user, isDemo, logout } = useAuth();
    const [userDropdown, setUserDropdown] = useState(false);
    const navItems = [
        { id: "home", label: "Home", icon: Home },

        { id: "playground", label: "Playground", icon: MessageSquareText },
        { id: "models", label: "Models", icon: Boxes },
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "keys", label: "API Keys", icon: KeyRound },
        { id: "providers", label: "Providers", icon: Cpu },
        { id: "docs", label: "Docs", icon: BookOpen },
    ];
    return (<header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div onClick={() => setCurrentTab("home")} className="flex items-center space-x-2.5 cursor-pointer group">
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
          </div>

          
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (<button key={item.id} onClick={() => setCurrentTab(item.id)} className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"}`}>
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-slate-400"}`}/>
                  <span>{item.label}</span>
                  {item.badge && (<span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold ml-1">
                      {item.badge}
                    </span>)}
                </button>);
        })}
          </nav>
        </div>

        
        <div className="flex items-center space-x-3">
          
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-slate-400">127.0.0.1:3000</span>
          </div>

          
          <button onClick={onOpenSettings} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition" title="Gateway Settings & BYOK Credentials">
            <Settings className="w-4 h-4"/>
          </button>

          
          {user ? (<div className="relative">
              <button onClick={() => setUserDropdown(!userDropdown)} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  {user.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-slate-200 truncate max-w-[100px]">{user.name}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400"/>
              </button>

              {userDropdown && (<div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl text-xs space-y-3 z-50" onClick={() => setUserDropdown(false)}>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="font-bold text-white text-sm">{user.name}</div>
                    <div className="text-slate-400 text-[11px] font-mono truncate">{user.email}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">Tier:</span>
                      <span className="font-semibold text-emerald-400">{user.tier}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] mt-1">
                      <span className="text-slate-400">Tokens Left:</span>
                      <span className="font-mono font-semibold text-slate-200">
                        {user.tokenBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {isDemo && (<button onClick={() => onOpenAuth("signup")} className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition text-center text-xs">
                      Save Account & Upgrade
                    </button>)}

                  <div className="pt-1 border-t border-slate-800">
                    <button onClick={logout} className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition text-left">
                      <LogOut className="w-4 h-4"/>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>)}
            </div>) : (<div className="flex items-center space-x-2">
              <button onClick={() => onOpenAuth("signin")} className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition">
                Sign In
              </button>
              <button onClick={() => onOpenAuth("signup")} className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md shadow-emerald-950/20">
                Get Started
              </button>
            </div>)}
        </div>
      </div>

      
      <div className="lg:hidden flex items-center justify-around border-t border-slate-800/60 bg-[#090d16] px-1 py-1.5 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (<button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center py-1 px-2.5 text-[11px] whitespace-nowrap ${active ? "text-emerald-400 font-bold" : "text-slate-400"}`}>
              <Icon className="w-4 h-4 mb-0.5"/>
              <span>{item.label}</span>
            </button>);
        })}
      </div>
    </header>);
};
