import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import { apiGetMe, apiLogin, apiRegister, apiDemoLogin, apiLogout } from "../api";
interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isDemo: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (name: string, email: string, pass: string) => Promise<void>;
    loginAsDemo: () => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const AuthProvider: React.FC<{
    children: React.ReactNode;
}> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem("anyllm_session_token"));
    const [isLoading, setIsLoading] = useState(true);
    const refreshUser = async () => {
        try {
            const me = await apiGetMe();
            if (me) {
                setUser(me);
            }
            else if (token) {
                localStorage.removeItem("anyllm_session_token");
                setToken(null);
                setUser(null);
            }
        }
        catch {
            setUser(null);
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (token) {
            refreshUser();
        }
        else {
            setIsLoading(false);
        }
    }, [token]);
    const login = async (email: string, pass: string) => {
        const res = await apiLogin(email, pass);
        localStorage.setItem("anyllm_session_token", res.token);
        setToken(res.token);
        setUser(res.user);
    };
    const register = async (name: string, email: string, pass: string) => {
        const res = await apiRegister(name, email, pass);
        localStorage.setItem("anyllm_session_token", res.token);
        setToken(res.token);
        setUser(res.user);
    };
    const loginAsDemo = async () => {
        const res = await apiDemoLogin();
        localStorage.setItem("anyllm_session_token", res.token);
        setToken(res.token);
        setUser(res.user);
    };
    const logout = async () => {
        await apiLogout();
        localStorage.removeItem("anyllm_session_token");
        setToken(null);
        setUser(null);
    };
    return (<AuthContext.Provider value={{
            user,
            token,
            isLoading,
            isDemo: !!user?.isDemo,
            login,
            register,
            loginAsDemo,
            logout,
            refreshUser,
        }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => useContext(AuthContext);
