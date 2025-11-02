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
    description: "Collect waste and earn GreenCoins",
    icon: Users,
  },
  {
    value: "factory",
    label: "Factory Owner",
    description: "Manage recycling operations and verify collectors",
    icon: Building2,
  },
  {
    value: "admin",
    label: "Administrator",
    description: "Manage platform and verify users",
    icon: Shield,
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="font-outfit font-bold text-4xl mb-4">
            Welcome to GreenCoin Africa
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your role to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role) => (
            <Card
              key={role.value}
              className={`p-6 cursor-pointer transition-all hover-elevate ${
                selectedRole === role.value
                  ? "border-primary bg-primary/5"
                  : ""
              }`}
              onClick={() => setSelectedRole(role.value)}
              data-testid={`card-role-${role.value}`}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <role.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-inter font-semibold text-xl mb-2">
                  {role.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {role.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedRole || mutation.isPending}
            data-testid="button-confirm-role"
          >
            {mutation.isPending ? "Setting up..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
