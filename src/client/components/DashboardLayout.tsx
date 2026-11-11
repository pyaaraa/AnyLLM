// SPDX-License-Identifier: MIT
// Copyright (c) 2025 AnyLLM

import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { DashboardNavbar } from "./DashboardNavbar";
import { SettingsModal } from "./SettingsModal";
import { GatewayStatus } from "../types";

interface DashboardLayoutProps {
  status: GatewayStatus | null;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ status }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <DashboardNavbar status={status} onOpenSettings={() => setIsSettingsOpen(true)} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};
