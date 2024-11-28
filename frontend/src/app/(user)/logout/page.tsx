"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/contexts/AuthContext";
import { redirect } from "next/navigation";

export default function Logout() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    redirect("/login");
  }, [logout]);

  return (
    <div>
      <h1>You have been logged out</h1>
      <p>Redirecting to the login page...</p>
    </div>
  );
}
