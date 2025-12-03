import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Mail, Leaf, AlertTriangle } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [credentials, setCredentials] = useState({
    email: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/admin/dashboard");
      toast({
        title: "Admin Login Successful",
        description: "Welcome to the admin dashboard.",
      });
      // Small delay to ensure user data is updated
      setTimeout(() => {
        setLocation("/admin/dashboard");
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate({
      username: credentials.email,
      password: credentials.password
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-green-600 rounded-2xl mb-4 shadow-lg">
            <Leaf className="h-10 w-10 text-white" />
          </div>
          <h1 className="font-outfit font-bold text-3xl mb-2 text-white">Admin Portal</h1>
          <p className="text-gray-400">Secure access for administrators</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-white">Admin Email</Label>
            <div className="relative mt-2">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                required
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder="admin@kudichain.io"
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                disabled={loginMutation.isPending}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type="password"
                required
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="••••••••"
                className="pl-10 bg-gray-800 border-gray-700 text-white"
                disabled={loginMutation.isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                Remember me
              </Label>
            </div>
            <button
              type="button"
              onClick={() => toast({
                title: "Password Recovery",
                description: "Please contact the system administrator for password reset.",
              })}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Forgot Password?
            </button>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loginMutation.isPending}>
            <Shield className="mr-2 h-5 w-5" />
            {loginMutation.isPending ? "Signing In..." : "Sign In as Admin"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setLocation("/")}
            className="text-sm text-gray-400 hover:text-primary transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        <div className="mt-8 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-200 font-medium mb-1">Security Notice</p>
              <p className="text-xs text-yellow-300/80">
                This is a restricted area. Unauthorized access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
