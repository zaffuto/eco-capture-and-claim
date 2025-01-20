'use client';

import React, { createContext, useContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: false,
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider 
      value={{ 
        session: null, 
        user: null, 
        loading: false, 
        error: null 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
