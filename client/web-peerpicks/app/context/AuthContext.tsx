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
    // We don't set loading(true) here to avoid flickering the whole UI
    // every time a component checks the session.
    try {
      const token = await getAuthToken();
      const userData = await getUserData();

      // Log for debugging (Remove in production)
      console.log("Auth Sync - Token:", !!token, "User:", userData?.email);

      if (token && userData) {
        setUser(userData);
        setToken(token);
        setIsAuthenticated(true);
      } else if (!token) {
        // ONLY set false if the token is actually gone
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = async () => {
    try {
      // 1. Immediate UI wipe
      setIsAuthenticated(false);
      setUser(null);

      // 2. Explicitly DELETE all local persistence
      await clearAuthCookies();

      // 3. Clear browser cache/state for the route
      router.replace("/login");
      router.refresh();
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
      {/* Only render children once the initial loading check is done 
                to prevent protected pages from flashing private data.
            */}
      {!loading && children}
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
