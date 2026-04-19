import { Navigate } from "react-router-dom";

import { RegisterForm } from "@/components/RegisterForm";
import { useAuth } from "@/context/AuthContext";

export function RegisterPage() {
  const { user, loading } = useAuth();

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <RegisterForm />;
}
