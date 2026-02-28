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
  loginSync: (userData: any, token: string) => void; // Added for instant UI updates
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /**
   * checkAuth: Synchronizes React state with Cookies.
   * Useful on page load or after a manual refresh.
   */
  const checkAuth = useCallback(async () => {
    try {
      const storedToken = await getAuthToken();
      const userData = await getUserData();

      if (storedToken && userData) {
        setUser(userData);
        setToken(storedToken);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("AUTH_SYNC_ERROR", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * loginSync: Pushes identity data directly into state.
   * This is the fix for the "must refresh" issue.
   */
  const loginSync = useCallback((userData: any, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    // No need to set loading here as it's already false by the time a user logs in
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * PROTOCOL COMPLIANT: Delete local identity [2026-02-01]
   */
  const logout = async () => {
    try {
      // 1. Explicitly DELETE all persistence
      await clearAuthCookies();

      // 2. Wipe UI state immediately
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);

      // 3. HARD DELETE: Clears memory heap and Axios headers
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
        loginSync,
      }}
    >
      {/* VETERAN MOVE: Prevent layout shift by waiting for checkAuth */}
      {!loading ? (
        children
      ) : (
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