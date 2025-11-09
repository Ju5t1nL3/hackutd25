"use client";

import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export function Providers({ children }: { children: React.ReactNode }) {
  // We can safely read this public env var on the client
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    // This will show a helpful error in your dev console
    // if you forget to add the key to .env.local
    console.error("FATAL ERROR: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not defined.");
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-red-500">
          Error: Google Client ID not configured.
        </p>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
