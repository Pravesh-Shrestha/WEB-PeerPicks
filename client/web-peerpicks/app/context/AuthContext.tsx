"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { clearAuthCookies, getAuthToken, getUserData } from "@/lib/cookie";
import { useRouter } from "next/navigation";

interface AuthContextProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  token?: string | null;
  user: any;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const storedToken = await getAuthToken();
      const userData = await getUserData();

      if (storedToken && userData) {
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        // If either is missing, ensure state is wiped
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("AUTH_SYNC_ERROR", err);
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * PROTOCOL COMPLIANT: Delete local identity [2026-02-01]
   * Using window.location.href ensures a complete memory wipe, 
   * preventing one user's SSE signals from leaking into another's session.
   */
  const logout = async () => {
    try {
      // 1. Explicitly DELETE all local persistence
      await clearAuthCookies();

      // 2. Immediate UI Wipe
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);

      // 3. HARD REFRESH: Clears Axios headers and React heap
      window.location.href = "/login"; 
    } catch (error) {
      console.error("Logout Protocol Error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        logout,
        loading,
        checkAuth,
        token,
      }}
    >
      {/* VETERAN MOVE: By showing children only after !loading, we prevent 
        protected dashboard components from mounting with a 'null' user.
      */}
      {!loading ? children : (
        <div className="flex h-screen w-full items-center justify-center bg-black font-mono text-[#D4FF33] uppercase tracking-[0.3em]">
          Initializing_Node...
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};