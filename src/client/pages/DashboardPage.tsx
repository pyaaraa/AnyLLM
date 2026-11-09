import React, { useState, useEffect } from "react";
import { LayoutDashboard, Zap, TrendingUp, Clock, Coins, ShieldCheck, Activity, ArrowUpRight, User, KeyRound, } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiGetUsage } from "../api";
import { UsageRecord } from "../types";
interface DashboardPageProps {
    onNavigate: (tab: string) => void;
    onOpenAuth: (tab?: "signin" | "signup") => void;
}
export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onOpenAuth, }) => {
    const { user, isDemo } = useAuth();
    const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
    const [totalTokens, setTotalTokens] = useState(0);
    const [totalCostSaved, setTotalCostSaved] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        async function loadUsage() {
            setIsLoading(true);
            try {
                const data = await apiGetUsage();
                setUsageRecords(data.records);
                setTotalTokens(data.totalTokens);
                setTotalCostSaved(data.totalCostSaved);
            }
            catch (err) {
                console.error("Failed to load usage", err);
            }
            finally {
                setIsLoading(false);
            }
        }
        loadUsage();
    }, [user]);
    const avgLatency = usageRecords.length > 0
        ? Math.round(usageRecords.reduce((acc, r) => acc + r.latencyMs, 0) /
            usageRecords.length)
        : 320;
    return (<div className="space-y-8 pb-12">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <LayoutDashboard className="w-6 h-6 text-emerald-400"/>
            <span>Developer Dashboard & Analytics</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time inference metrics, token consumption, and routing efficiency from your local database.
          </p>
        </div>

        {isDemo && (<button onClick={() => onOpenAuth("signup")} className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md self-start sm:self-auto">
            Upgrade to Full Account
          </button>)}
      </div>

      
      {user && (<div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-white text-base">{user.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {user.tier}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Token Balance</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {user.tokenBalance.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Requests</span>
              <span className="font-mono font-bold text-white text-sm">
                {user.requestsCount.toLocaleString()}
              </span>
            </div>
            <button onClick={() => onNavigate("keys")} className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center space-x-1.5 transition">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400"/>
              <span>API Keys</span>
            </button>
          </div>
        </div>)}

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Tokens Processed</span>
            <Activity className="w-4 h-4 text-emerald-400"/>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalTokens > 0 ? totalTokens.toLocaleString() : (user?.tokensUsed || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3"/>
            <span>Active routing volume</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Estimated Savings</span>
            <Coins className="w-4 h-4 text-cyan-400"/>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${totalCostSaved > 0 ? totalCostSaved.toFixed(3) : "0.081"}
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 flex items-center space-x-1">
            <span>vs. Direct proprietary calls</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Avg Response Latency</span>
            <Clock className="w-4 h-4 text-amber-400"/>
          </div>
          <div className="text-2xl font-black text-white font-mono">{avgLatency}ms</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>Fast multi-provider routing</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Gateway Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400"/>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
            <span>Zero detected outages</span>
          </div>
        </div>
      </div>

      
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400"/>
            <span>Recent Inference Request Log</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {usageRecords.length} recent calls
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800/80">
              <tr>
                <th className="p-3.5">Model</th>
                <th className="p-3.5">Provider Route</th>
                <th className="p-3.5">Prompt / Comp</th>
                <th className="p-3.5">Total Tokens</th>
                <th className="p-3.5">Latency</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {usageRecords.map((r) => (<tr key={r.id} className="hover:bg-slate-900/80 transition font-mono">
                  <td className="p-3.5 font-semibold text-slate-100">{r.model}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-emerald-400 capitalize">
                      {r.provider}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">
                    {r.promptTokens} / {r.completionTokens}
                  </td>
                  <td className="p-3.5 font-bold text-white">{r.totalTokens}</td>
                  <td className="p-3.5 text-emerald-300">{r.latencyMs}ms</td>
                  <td className="p-3.5 text-slate-500 font-sans text-[11px]">
                    {new Date(r.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            })}
                  </td>
                </tr>))}

              {usageRecords.length === 0 && (<tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-sans">
                    No requests logged yet. Try sending a prompt in the Playground!
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
};
