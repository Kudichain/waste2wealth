import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Leaf, Store, Shield } from "lucide-react";

export default function VendorLogin() {
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const loginMutation = useMutation({
    mutationFn: async (usernameValue: string) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: usernameValue, role: "vendor" }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Unable to sign in");
      }

      return response.json();
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome back",
        description: "Redirecting to your dashboard...",
      });
      setLocation("/vendors/dashboard");
      const role = data?.user?.role;
      if (role === "vendor") {
        setLocation("/vendors/dashboard");
      } else {
        setLocation("/vendors/register");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSocialLogin = (provider: "google" | "facebook") => {
    window.location.href = `/api/auth/${provider}?role=vendor`;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Enter the username you registered with.",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate(username.trim());
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-lg">
            <Store className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="font-outfit text-3xl">Local Vendor Sign In</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Access your drop confirmations, wallet controls, and vendor analytics dashboard.
          </CardDescription>
          <p className="text-sm text-primary font-medium">
            Clean streets. Earn coins. Build futures.
          </p>
        </CardHeader>

        <div className="px-6 space-y-4 mb-6">
          <Button
            onClick={() => handleSocialLogin("google")}
            className="w-full"
            variant="outline"
          >
            Continue with Google
          </Button>
          
          <Button
            onClick={() => handleSocialLogin("facebook")}
            className="w-full"
            variant="outline"
          >
            Continue with Facebook
          </Button>
        </div>

        <div className="relative px-6 mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with username</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Vendor username</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                placeholder="e.g., KofarWambaiVendor"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={loginMutation.isPending}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember" 
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                onClick={() => toast({
                  title: "Password Recovery",
                  description: "Please contact support for account recovery.",
                })}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing you in..." : "Continue"}
            </Button>
          </div>
        </form>

        <CardFooter className="flex flex-col gap-4">
          <div className="w-full text-center text-sm text-muted-foreground">
            New to KudiChain vendor network?{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => setLocation("/vendors/register")}
            >
              Create an account
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg w-full">
            <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-blue-800 dark:text-blue-300">
              Use a single username across collector and vendor apps for faster verification.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
