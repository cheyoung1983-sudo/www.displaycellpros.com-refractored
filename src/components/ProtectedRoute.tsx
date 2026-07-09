import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ShieldAlert, Loader2, RefreshCw, Mail } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};
