import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building2, Shield } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const roles = [
  {
    value: "collector",
    label: "Waste Collector",
    description: "Collect, sort, and drop off verified recyclables to earn KOBO in minutes.",
    icon: Users,
    perks: ["Live pricing feed", "Same-day payouts", "Impact badges"],
  },
  {
    value: "vendor",
    label: "Vendor / Factory",
    description: "Operate compliant hubs, verify deliveries, and unlock factory financing.",
    icon: Building2,
    perks: ["Digital manifests", "Traceability APIs", "Preferred logistics"],
  },
];

export default function RoleSelector() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (role: string) => {
      await apiRequest("PATCH", "/api/auth/user/role", { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Role Updated",
        description: "Your role has been set successfully!",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (selectedRole) {
      mutation.mutate(selectedRole);
    }
  };
  const highlights = [
    { label: "Cities onboarded", value: "44" },
    { label: "Verified partners", value: "120+" },
    { label: "Avg. payout time", value: "4m" },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(16,185,129,0.25),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_120%,rgba(59,130,246,0.25),transparent_45%)]" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/10 hidden lg:block" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 mb-4">Role selector</p>
            <h1 className="font-outfit font-black text-5xl leading-tight mb-4">
              Choose how you power the Waste2Wealth movement.
            </h1>
            <p className="text-white/80 text-lg">
              Every pathway unlocks training, live dashboards, and verified payouts. Pick the role that matches how you want to contribute today—you can always switch later.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {highlights.map((highlight) => (
              <div key={highlight.label} className="flex-1 min-w-[150px] bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                <p className="text-sm text-white/60 uppercase tracking-[0.25em]">{highlight.label}</p>
                <p className="text-3xl font-bold mt-2">{highlight.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-300" />
              <div>
                <p className="text-base font-semibold">Switch-ready access</p>
                <p className="text-sm text-white/70">Your credentials follow you. Change roles without reapplying.</p>
              </div>
            </div>
            <div className="text-sm text-white/70">
              We sync your compliance docs, payout wallets, and performance history so you can scale from collector to vendor effortlessly.
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-[28px] backdrop-blur-2xl p-8 shadow-[0_25px_80px_rgba(15,23,42,0.45)]">
            <p className="text-white/70 text-sm mb-4">Choose a track</p>
            <div className="grid gap-4">
              {roles.map((role) => (
                <button
                  key={role.value}
                  onClick={() => setSelectedRole(role.value)}
                  data-testid={`card-role-${role.value}`}
                  className={`text-left relative overflow-hidden rounded-2xl border transition-all duration-300 p-6 flex flex-col gap-3 ${
                    selectedRole === role.value
                      ? "border-emerald-400 bg-gradient-to-br from-emerald-400/10 to-slate-900"
                      : "border-white/15 bg-white/5 hover:border-white/40"
                  }`}
                  aria-pressed={selectedRole === role.value}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                      <role.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-white/50">Pathway</p>
                      <h3 className="text-2xl font-semibold">{role.label}</h3>
                    </div>
                  </div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {role.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {role.perks.map((perk) => (
                      <span key={perk} className="px-3 py-1 rounded-full text-xs bg-white/10 border border-white/15">
                        {perk}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            <Button
              size="lg"
              className="w-full mt-8 bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-900 font-semibold hover:from-emerald-300 hover:to-cyan-300"
              onClick={handleSubmit}
              disabled={!selectedRole || mutation.isPending}
              data-testid="button-confirm-role"
            >
              {mutation.isPending ? "Personalizing..." : "Continue"}
            </Button>
          </div>

          <p className="text-center text-white/60 text-sm">
            Need another path? Talk to our onboarding team at <span className="text-white">support@waste2wealth.ng</span>
          </p>
        </div>
      </div>
    </section>
  );
}
