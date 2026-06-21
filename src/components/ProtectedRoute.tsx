import React from "react";
import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../lib/api";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    // Save current path to redirect back later if needed
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If authenticated but role is wrong, redirect to home/login
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
