import { createContext, useContext, useEffect, useState } from "react";
import { useStorageState } from "../hooks/useStorageState";
import { api } from "../utils/api";

interface User {
  id: string;
  phoneNumber: string;
  userType: "patient" | "doctor" | "admin";
  isPhoneVerified: boolean;
  name: string;
  sehatId: string;
  dateOfBirth: string;
  gender?: "male" | "female" | "other";
}

interface Session {
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  signIn: (phoneNumber: string) => Promise<void>;
  signUp: (
    phoneNumber: string,
    userType: "patient" | "doctor",
    name: string,
    dateOfBirth: string,
    gender?: "male" | "female"
  ) => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [[isLoading, session], setSession] = useStorageState<Session | null>(
    "session",
    null
  );

  const signIn = async (phoneNumber: string) => {
    try {
      const response = await api.post("/auth/login", { phoneNumber });
      // OTP will be sent to the phone number
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signUp = async (
    phoneNumber: string,
    userType: "patient" | "doctor",
    name: string,
    dateOfBirth: string,
    gender?: "male" | "female"
  ) => {
    try {
      const response = await api.post("/auth/register", {
        phoneNumber,
        userType,
        name,
        dateOfBirth,
        gender,
      });
      // OTP will be sent to the phone number
      return response.data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string) => {
    try {
      console.log("phoneNumber", phoneNumber);
      console.log("otp", otp);

      if (!phoneNumber || !otp) {
        throw new Error("Phone number and OTP are required");
      }
      const response = await api.post("/auth/verify-otp", { phoneNumber, otp });
      const { accessToken, refreshToken, user } = response.data.data;
      setSession({ accessToken, refreshToken, user });
      return response.data;
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  };

  const signOut = () => {
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        signIn,
        signUp,
        verifyOTP,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSession() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
