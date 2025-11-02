import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import RoleSelector from "./RoleSelector";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && user.role) {
      // Redirect based on role
      if (user.role === "collector") {
        setLocation("/collector");
      } else if (user.role === "factory") {
        setLocation("/factory");
      } else if (user.role === "admin") {
        setLocation("/collector"); // Admin can see collector view for now
      }
    }
  }, [user, setLocation]);

  // If user doesn't have a role yet, show role selector
  if (user && !user.role) {
    return <RoleSelector />;
  }

  // Loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    </div>
  );
}
