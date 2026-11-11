// SPDX-License-Identifier: MIT
// Copyright (c) 2025 AnyLLM

import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PublicLayout } from "./components/PublicLayout";
import { DashboardLayout } from "./components/DashboardLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ModelsPage } from "./pages/ModelsPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { DocsPage } from "./pages/DocsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { UsagePage } from "./pages/UsagePage";
import { ProvidersPage } from "./pages/ProvidersPage";
import { SettingsPage } from "./pages/SettingsPage";

import { Model, Provider, GatewayStatus } from "./types";
import { fetchModels, fetchProviders, fetchGatewayStatus } from "./api";

const AnyLLMApp: React.FC = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [status, setStatus] = useState<GatewayStatus | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [modelsData, providersData, statusData] = await Promise.all([
          fetchModels().catch(() => []),
          fetchProviders().catch(() => []),
          fetchGatewayStatus().catch(() => null),
        ]);
        setModels(modelsData);
        setProviders(providersData);
        setStatus(statusData);
      } catch (err) {
        console.error("Initialization error", err);
      }
    }
    init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public & Adaptive Layout Routes */}
        <Route element={<PublicLayout status={status} />}>
          <Route path="/" element={<HomePage models={models} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/models" element={<ModelsPage models={models} />} />
          <Route path="/playground" element={<PlaygroundPage models={models} />} />
          <Route path="/docs" element={<DocsPage />} />
        </Route>

        {/* Protected Dashboard Layout Routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout status={status} />}>
            <Route index element={<DashboardPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="usage" element={<UsagePage />} />
            <Route path="providers" element={<ProvidersPage providers={providers} />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AnyLLMApp />
    </AuthProvider>
  );
};

export default App;
