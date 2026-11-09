import React, { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { SettingsModal } from "./components/SettingsModal";
import { HomePage } from "./pages/HomePage";
import { DemoPage } from "./pages/DemoPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";
import { ModelsPage } from "./pages/ModelsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ApiKeysPage } from "./pages/ApiKeysPage";
import { ProvidersPage } from "./pages/ProvidersPage";
import { DocsPage } from "./pages/DocsPage";
import { Model, Provider, GatewayStatus } from "./types";
import { fetchModels, fetchProviders, fetchGatewayStatus } from "./api";
const AnyLLMApp: React.FC = () => {
    const [currentTab, setCurrentTab] = useState("home");
    const [models, setModels] = useState<Model[]>([]);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [status, setStatus] = useState<GatewayStatus | null>(null);
    const [selectedModelId, setSelectedModelId] = useState("openai/gpt-4o");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [authModalState, setAuthModalState] = useState<{
        isOpen: boolean;
        tab: "signin" | "signup";
    }>({
        isOpen: false,
        tab: "signin",
    });
    useEffect(() => {
        async function init() {
            try {
                const [modelsData, providersData, statusData] = await Promise.all([
                    fetchModels(),
                    fetchProviders(),
                    fetchGatewayStatus(),
                ]);
                setModels(modelsData);
                setProviders(providersData);
                setStatus(statusData);
                if (modelsData.length > 0) {
                    const firstNonWildcard = modelsData.find((m) => m.id !== "*");
                    if (firstNonWildcard) {
                        setSelectedModelId(firstNonWildcard.id);
                    }
                }
            }
            catch (err) {
                console.error("Initialization error", err);
            }
        }
        init();
    }, []);
    const handleSelectModelForChat = (modelId: string) => {
        setSelectedModelId(modelId);
        setCurrentTab("playground");
    };
    const openAuth = (tab: "signin" | "signup" = "signin") => {
        setAuthModalState({ isOpen: true, tab });
    };
    return (<div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} status={status} onOpenSettings={() => setIsSettingsOpen(true)} onOpenAuth={openAuth}/>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === "home" && (<HomePage onNavigate={setCurrentTab} onOpenAuth={openAuth} models={models}/>)}

        {currentTab === "demo" && (<DemoPage onNavigate={setCurrentTab} onOpenAuth={openAuth}/>)}

        {currentTab === "playground" && (<PlaygroundPage models={models.filter((m) => m.id !== "*")} selectedModelId={selectedModelId} onSelectModel={setSelectedModelId}/>)}

        {currentTab === "models" && (<ModelsPage models={models} onSelectModelForChat={handleSelectModelForChat}/>)}

        {currentTab === "dashboard" && (<DashboardPage onNavigate={setCurrentTab} onOpenAuth={openAuth}/>)}

        {currentTab === "keys" && <ApiKeysPage />}

        {currentTab === "providers" && <ProvidersPage providers={providers}/>}

        {currentTab === "docs" && <DocsPage />}
      </main>

      <AuthModal isOpen={authModalState.isOpen} onClose={() => setAuthModalState({ ...authModalState, isOpen: false })} initialTab={authModalState.tab}/>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}/>
    </div>);
};
export const App: React.FC = () => {
    return (<AuthProvider>
      <AnyLLMApp />
    </AuthProvider>);
};
export default App;
