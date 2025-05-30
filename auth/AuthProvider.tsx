import { init } from "@instantdb/react-native";
import { NavigationProp, ParamListBase, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import schema from "~/instant.schema";

interface AuthContextType {
  user: string | null;
  signIn: (email: string, navigation: StackNavigationProp<ParamListBase>) => Promise<void>;
  signOut: () => Promise<void>;
  skipSignIn: () => Promise<void>;
  verifyCode: (code: string, email: string) => Promise<void>;
}

type RootStackParamList = {
  verifyEmail: { email: string };
};

export type VerifyEmailRouteProp = RouteProp<RootStackParamList, "verifyEmail">;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

if (!process.env.EXPO_PUBLIC_INSTANT_APP_ID) {
  throw new Error("EXPO_PUBLIC_INSTANT_APP_ID is not defined in environment variables");
}

export const db = init({
  appId: process.env.EXPO_PUBLIC_INSTANT_APP_ID,
  schema: schema,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("sessionToken");
      const skipped = await SecureStore.getItemAsync("skipSignIn");

      if (storedToken) {
        setUser(storedToken);
      } else if (skipped === "true") {
        setUser("Guest");
      }
    } catch (error) {
      console.error("Error checking session:", error);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, navigation: StackNavigationProp<ParamListBase>) => {
      try {
        await db.auth.sendMagicCode({ email }).catch((err) => {
          alert("Uh oh :" + err.body?.message);
        });
        // setUser(email)
        await SecureStore.setItemAsync("sessionToken", email);
        navigation.navigate("verifyEmail", { email: email });
      } catch (error) {
        console.error("Sign-in error:", error);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync("sessionToken");
      await SecureStore.deleteItemAsync("skipSignIn"); // Clear skipSignIn flag as well
      setUser(null);
      // navigation.reset({ index: 0, routes: [{ name: "signIn" }] });
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  }, []);

  const skipSignIn = useCallback(async () => {
    try {
      await SecureStore.setItemAsync("skipSignIn", "true");
      setUser("Guest");
      // navigation.reset({ index: 0, routes: [{ name: "index" }] });
    } catch (error) {
      console.error("Skip sign-in error:", error);
    }
  }, []);

  const verifyCode = useCallback(async (code: string, email: string) => {
    try {
      await db.auth.signInWithMagicCode({ email, code });
      await SecureStore.setItemAsync("currentUser", email);
      setUser(email);
    } catch (error: any) {
      alert("Uh oh :" + error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, skipSignIn, verifyCode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
