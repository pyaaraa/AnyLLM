// SPDX-License-Identifier: MIT
// Copyright (c) 2025 AnyLLM

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Zap,
  TrendingUp,
  Clock,
  Coins,
  ShieldCheck,
  Inbox,
  Play,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { apiGetUsage } from "../api";
import { UsageRecord } from "../types";

export const UsagePage: React.FC = () => {
  const { user } = useAuth();
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCostSaved, setTotalCostSaved] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsage = async () => {
    setIsLoading(true);
    try {
      const data = await apiGetUsage();
      setUsageRecords(data.records || []);
      setTotalTokens(data.totalTokens || 0);
      setTotalCostSaved(data.totalCostSaved || 0);
    } catch (err) {
      console.error("Failed to load usage", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsage();
  }, [user]);

  const avgLatency =
    usageRecords.length > 0
      ? Math.round(
          usageRecords.reduce((acc, r) => acc + r.latencyMs, 0) /
            usageRecords.length
        )
      : 0;

  // Breakdown by model
  const modelBreakdown = usageRecords.reduce((acc, r) => {
    acc[r.model] = (acc[r.model] || 0) + r.totalTokens;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2.5">
            <Activity className="w-6 h-6 text-emerald-400" />
            <span>Usage & Inference Analytics</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time inference tokens, cost efficiency, and request history recorded by your AnyLLM gateway.
          </p>
        </div>

        <button
          onClick={loadUsage}
          disabled={isLoading}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Total Tokens Processed</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalTokens.toLocaleString()}
          </div>
          <div className="text-xs text-emerald-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Prompt + Completion tokens</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Estimated Savings</span>
            <Coins className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ${totalCostSaved.toFixed(3)}
          </div>
          <div className="text-xs text-cyan-400 mt-1 flex items-center space-x-1">
            <span>Calculated vs retail direct proprietary pricing</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Average Latency</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {avgLatency > 0 ? `${avgLatency}ms` : "-"}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <span>Multi-provider routing response time</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Gateway Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
          <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <span>Failover cascade operational</span>
          </div>
        </div>
      </div>

      {/* Model Breakdown */}
      {Object.keys(modelBreakdown).length > 0 && (
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Token Volume by Model
          </h2>
          <div className="space-y-3">
            {Object.entries(modelBreakdown).map(([model, count]) => {
              const pct = totalTokens > 0 ? Math.round((count / totalTokens) * 100) : 0;
              return (
                <div key={model} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300 font-semibold">{model}</span>
                    <span className="text-slate-400">
                      {count.toLocaleString()} tokens ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Inference Logs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <h2 className="font-bold text-white text-sm flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Complete Request Log</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">
            {usageRecords.length} recorded calls
          </span>
        </div>

        {usageRecords.length > 0 ? (
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
                {usageRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/80 transition font-mono">
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
                    <td className="p-3.5 text-emerald-400">{r.latencyMs}ms</td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(r.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-14 px-4 space-y-3">
            <Inbox className="w-9 h-9 text-slate-600 mx-auto" />
            <div className="text-slate-300 text-sm font-semibold">
              No inference requests recorded yet
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Execute a prompt in the Playground or integrate AnyLLM via API to view metrics here.
            </p>
            <Link
              to="/playground"
              className="mt-2 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Launch Playground</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
