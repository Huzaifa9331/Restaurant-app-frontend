
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "./client";

const STORAGE_KEY = "restaurant_auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [restoring, setRestoring] = useState(true);

  // RESTORE SESSION
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const session = JSON.parse(saved);

          if (session.token && session.user) {
            setAuthToken(session.token);
            setToken(session.token);
            setUser(session.user);
          }
        }
      } catch (error) {
        console.log("Session restoration error:", error);
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setRestoring(false);
      }
    };

    restoreSession();
  }, []);

  // SAVE LOGIN / SIGNUP SESSION
  const saveSession = async (response) => {
    if (!response?.success || !response?.token || !response?.user) {
      throw new Error(
        "Server did not return the required token and user information."
      );
    }

    const newSession = {
      token: response.token,
      user: response.user,
    };

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newSession)
    );

    setAuthToken(response.token);
    setToken(response.token);
    setUser(response.user);

    return response.user;
  };

  // LOGIN
  const login = async (email, password) => {
    const response = await api.post("/user/signIn", {
      email,
      password,
    });

    return await saveSession(response);
  };

  // REGISTER
  const register = async (name, email, password) => {
    const response = await api.post("/user/signUp", {
      name,
      email,
      password,
      role: "Customer",
    });

    return await saveSession(response);
  };

  // LOGOUT
  const logout = async () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);

    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = {
    user,
    token,
    restoring,
    isAuthenticated: !!user && !!token,
    isManager: user?.role === "Manager",
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
