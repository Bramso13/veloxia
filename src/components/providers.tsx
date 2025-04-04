"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import React from "react";
interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <SessionProvider>
      <Toaster position="top-center" />
      {children}
    </SessionProvider>
  );
};
