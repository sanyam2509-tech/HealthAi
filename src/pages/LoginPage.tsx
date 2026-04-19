import { Navigate } from "react-router-dom";

import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";

export function LoginPage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginForm />;
}
