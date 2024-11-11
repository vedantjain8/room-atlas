"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    // redirect to login page
    window.location.href = "/login";  
  }, [logout]);

  return (
    <div>
      <h1>You have been logged out</h1>
      <p>Redirecting to the login page...</p>
    </div>
  );
}
