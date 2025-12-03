import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Leaf, User, Store, Shield, Info, Lock, Sparkles, ArrowLeft } from "lucide-react";

type UserRole = "collector" | "vendor";

const roleCards: Record<UserRole, { title: string; subtitle: string; bullets: string[]; icon: typeof User }> = {
  collector: {
    title: "Login as Collector",
    subtitle: "Collect, sort, and cash out verified recyclables.",
    bullets: ["Live pricing per kg", "Instant KOBO payouts", "Impact badges"],
    icon: User,
  },
  vendor: {
    title: "Login as Local Vendor",
    subtitle: "Buy waste, manage depots, and automate payouts.",
    bullets: ["Digital manifests", "Traceability API", "Factory logistics"],
    icon: Store,
  },
};

export default function Login() {
  const [step, setStep] = useState<"role" | "login">("role");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const mutation = useMutation({
    mutationFn: async (data: { username: string; password: string; role?: UserRole }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome!",
        description: "You've successfully logged in.",
      });

      const role = data?.user?.role;
      if (role === "collector") {
        setLocation("/collector");
      } else if (role === "vendor") {
        setLocation("/vendors/dashboard");
      } else {
        setLocation("/");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep("login");
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    if (!selectedRole) return;
    window.location.href = `/api/auth/${provider}?role=${selectedRole}`;
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim() && selectedRole) {
      mutation.mutate({ username: username.trim(), password: password.trim(), role: selectedRole });
    }
  };

  const handleBack = () => {
    setStep("role");
    setSelectedRole(null);
    setUsername("");
    setPassword("");
  };

  if (step === "role") {
    return (
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-sky-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(16,185,129,0.25),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(59,130,246,0.18),transparent_45%)]" />
        <Card className="relative w-full max-w-2xl p-10 rounded-[32px] border border-white/40 bg-white/90 backdrop-blur-2xl shadow-[0_35px_120px_rgba(15,23,42,0.15)]">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-5 shadow-2xl">
              <Leaf className="h-10 w-10 text-white" />
            </div>
            <p className="text-xs uppercase tracking-[0.35em] text-emerald-600">Waste2Wealth Access</p>
            <h1 className="font-outfit font-black text-4xl mt-3 mb-3">Welcome to KudiChain</h1>
            <p className="text-muted-foreground max-w-lg">
              Clean streets. Earn coins. Build futures. Pick how you want to join the movement.
            </p>
          </div>

          <div className="space-y-4">
            {Object.entries(roleCards).map(([roleKey, card]) => (
              <button
                key={roleKey}
                onClick={() => handleRoleSelect(roleKey as UserRole)}
                type="button"
                className="w-full text-left group"
              >
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg">{card.title}</p>
                        <Info className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{card.subtitle}</p>
                      <div className="flex flex-wrap gap-2">
                        {card.bullets.map((bullet) => (
                          <span key={bullet} className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                            {bullet}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">Secure and verified</p>
                <p className="text-sm text-blue-700">
                  Your data is protected. All transactions are encrypted and verified.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-700">
              <Lock className="h-4 w-4" />
              SOC 2 • ISO 27001 • Biometric session locks
            </div>
          </div>
        </Card>
      </section>
    );
  }

  const activeRole = selectedRole ?? "collector";

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(16,185,129,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(14,165,233,0.2),transparent_45%)]" />
      <Card className="relative w-full max-w-3xl rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-0 overflow-hidden shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="p-10 border-b md:border-b-0 md:border-r border-white/10 space-y-6">
            <button onClick={handleBack} type="button" className="group flex items-center gap-2 text-sm text-white/70">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Switch role
            </button>
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/60 mb-3">{activeRole === "collector" ? "Collector" : "Vendor"} access</p>
              <h1 className="font-outfit font-black text-4xl leading-tight mb-4">
                {activeRole === "collector" ? "Collector Login" : "Vendor Login"}
              </h1>
              <p className="text-white/75 text-lg">
                Clean streets, earn KOBO, and follow your impact in real time.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-emerald-300" />
                <p className="font-semibold">Benefits in this workspace</p>
              </div>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Unified wallet + real-time payouts</li>
                <li>• Biometric-ready logins (coming soon)</li>
                <li>• Support team on standby</li>
              </ul>
            </div>
          </div>

          <div className="p-10 space-y-5">
            <div className="space-y-3">
              <Button
                onClick={() => handleSocialLogin("google")}
                className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                variant="ghost"
              >
                Continue with Google
              </Button>
              <Button
                onClick={() => handleSocialLogin("facebook")}
                className="w-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
                variant="ghost"
              >
                Continue with Facebook
              </Button>
            </div>

            <div className="relative text-center">
              <div className="h-px bg-white/10" />
              <span className="inline-block px-3 text-[11px] uppercase tracking-[0.3em] text-white/50 -mt-3 bg-transparent">
                Or use credentials
              </span>
            </div>

            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={mutation.isPending}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={mutation.isPending}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>

              <div className="flex items-center justify-between text-white/70">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-white/40 data-[state=checked]:bg-white/80"
                  />
                  <Label htmlFor="remember" className="text-sm cursor-pointer text-white/70">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={() => toast({
                    title: "Password Recovery",
                    description: "Please contact support for account recovery.",
                  })}
                  className="text-sm text-emerald-200 hover:text-emerald-100 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold hover:from-emerald-300 hover:to-cyan-300"
                disabled={!username.trim() || !password.trim() || mutation.isPending}
              >
                {mutation.isPending ? "Logging in..." : "Continue"}
              </Button>
            </form>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-sm text-white/70 flex items-center gap-3">
              <Shield className="h-5 w-5 text-emerald-200" />
              <span>Your account is secured with end-to-end encryption & compliance-ready monitoring.</span>
            </div>

            <p className="text-sm text-white/70 text-center">
              New here?{" "}
              <button
                onClick={() => setLocation("/collectors/register")}
                className="text-white font-semibold underline-offset-4 hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
