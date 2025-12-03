import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Leaf, Loader2, ShieldCheck, Store, User, MapPin, CheckCircle2 } from "lucide-react";
import { nigeriaStates } from "@/data/nigeriaStates";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface VendorProfileForm {
  businessName: string;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  contactEmail: string;
  state: string;
  lga: string;
  ward: string;
  address: string;
  services: string;
}

export default function VendorOnboarding() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState<VendorProfileForm>({
    businessName: "",
    contactFirstName: "",
    contactLastName: "",
    contactPhone: "",
    contactEmail: "",
    state: "",
    lga: "",
    ward: "",
    address: "",
    services: "",
  });
  const [openStatePopover, setOpenStatePopover] = useState(false);
  const [openLGAPopover, setOpenLGAPopover] = useState(false);

  const { data: existingProfile } = useQuery({
    queryKey: ["/api/vendors/profile"],
    queryFn: async () => {
      const response = await fetch("/api/vendors/profile", { 
        credentials: "include" 
      });
      if (response.status === 401 || response.status === 404) return null;
      if (!response.ok) throw new Error("Failed to load profile");
      return response.json();
    },
    retry: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/vendors/login");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  useEffect(() => {
    if (existingProfile?.profile) {
      setForm((prev) => ({
        ...prev,
        businessName: existingProfile.profile.businessName || prev.businessName,
        address: existingProfile.profile.address || prev.address,
        state: existingProfile.profile.state || prev.state,
        lga: existingProfile.profile.lga || prev.lga,
        ward: existingProfile.profile.ward || prev.ward,
        services: Array.isArray(existingProfile.profile.services)
          ? existingProfile.profile.services.join(", ")
          : prev.services,
      }));
      if (existingProfile.user) {
        setForm((prev) => ({
          ...prev,
          contactFirstName: existingProfile.user.firstName || prev.contactFirstName,
          contactLastName: existingProfile.user.lastName || prev.contactLastName,
          contactPhone: existingProfile.user.phoneNumber || prev.contactPhone,
          contactEmail: existingProfile.user.email || prev.contactEmail,
        }));
      }
      setStep(2);
    }
  }, [existingProfile]);

  useEffect(() => {
    if (existingProfile?.user?.role === "vendor") {
      setStep(3);
      toast({
        title: "Profile already complete",
        description: "Taking you to your vendor dashboard...",
      });
      setTimeout(() => setLocation("/vendors/dashboard"), 1800);
    }
  }, [existingProfile, setLocation, toast]);

  const currentLGAs = useMemo(() => {
    const stateEntry = nigeriaStates.find((state) => state.name === form.state);
    return stateEntry ? stateEntry.lgas : [];
  }, [form.state]);

  const mutation = useMutation({
    mutationFn: async (payload: VendorProfileForm) => {
      const response = await apiRequest("POST", "/api/vendors/profile", {
        businessName: payload.businessName,
        contactFirstName: payload.contactFirstName,
        contactLastName: payload.contactLastName,
        contactPhone: payload.contactPhone,
        contactEmail: payload.contactEmail,
        state: payload.state,
        lga: payload.lga,
        ward: payload.ward,
        address: payload.address,
        services: payload.services
          ? payload.services
              .split(",")
              .map((entry) => entry.trim())
              .filter(Boolean)
          : undefined,
      });

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/profile"] });
      toast({
        title: "Vendor profile saved",
        description: "Redirecting you to your dashboard...",
      });
      setStep(3);
      setTimeout(() => setLocation("/vendors/dashboard"), 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Unable to complete setup",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: keyof VendorProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.businessName || !form.contactFirstName || !form.contactPhone) {
      toast({
        title: "Missing required details",
        description: "Business name, contact name, and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    if (!form.state || !form.lga) {
      toast({
        title: "Select your service area",
        description: "Choose your state and LGA before continuing.",
        variant: "destructive",
      });
      return;
    }

    mutation.mutate(form);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-emerald-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />
      <main className="flex-1 py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <ShieldCheck className="h-4 w-4" /> Local Vendor Onboarding
            </div>
            <h1 className="font-outfit text-3xl md:text-4xl font-extrabold">
              Become a verified KudiChain vendor
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with collectors, confirm deliveries, and unlock fast KOBO settlements for every kilogram you process.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" /> Step {step === 3 ? 2 : step} of 2
              </CardTitle>
              <CardDescription>
                {step === 1 && "Share your business and contact information."}
                {step === 2 && "Tell us where you operate and the wards you serve."}
                {step === 3 && "Profile complete."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={step === 1 ? 50 : 100} className="h-2" />
            </CardContent>
          </Card>

          {step !== 3 ? (
            <Card className="shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-10">
                <CardHeader className="border-b bg-muted/20">
                  <CardTitle>Vendor profile</CardTitle>
                  <CardDescription>
                    Provide accurate information so collectors and factories can trust your payouts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <section className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <User className="h-3.5 w-3.5" /> Business identity
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="businessName">Business or trading name *</Label>
                        <Input
                          id="businessName"
                          placeholder="e.g., EcoHub Sabon Gari"
                          value={form.businessName}
                          onChange={(event) => handleChange("businessName", event.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="contactFirstName">Contact first name *</Label>
                          <Input
                            id="contactFirstName"
                            value={form.contactFirstName}
                            onChange={(event) => handleChange("contactFirstName", event.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contactLastName">Contact last name</Label>
                          <Input
                            id="contactLastName"
                            value={form.contactLastName}
                            onChange={(event) => handleChange("contactLastName", event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone number *</Label>
                        <Input
                          id="contactPhone"
                          placeholder="+234"
                          value={form.contactPhone}
                          onChange={(event) => handleChange("contactPhone", event.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="vendor@example.com"
                          value={form.contactEmail}
                          onChange={(event) => handleChange("contactEmail", event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="services">Materials you process</Label>
                      <Textarea
                        id="services"
                        placeholder="Separate materials with commas e.g. Plastic, Metal, Paper"
                        value={form.services}
                        onChange={(event) => handleChange("services", event.target.value)}
                        rows={2}
                      />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <MapPin className="h-3.5 w-3.5" /> Service coverage
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>State *</Label>
                        <Popover open={openStatePopover} onOpenChange={setOpenStatePopover}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              {form.state || "Select state"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0">
                            <Command>
                              <CommandInput placeholder="Search states" />
                              <CommandList>
                                <CommandEmpty>No state found.</CommandEmpty>
                                <CommandGroup>
                                  {nigeriaStates.map((state) => (
                                    <CommandItem
                                      key={state.name}
                                      value={state.name}
                                      onSelect={(value) => {
                                        handleChange("state", value);
                                        handleChange("lga", "");
                                        setOpenStatePopover(false);
                                      }}
                                    >
                                      {state.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Local government *</Label>
                        <Popover open={openLGAPopover} onOpenChange={setOpenLGAPopover}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between"
                              disabled={!currentLGAs.length}
                            >
                              {form.lga || "Select LGA"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-0">
                            <Command>
                              <CommandInput placeholder="Search LGAs" />
                              <CommandList>
                                <CommandEmpty>No LGA found.</CommandEmpty>
                                <CommandGroup>
                                  {currentLGAs.map((lga) => (
                                    <CommandItem
                                      key={lga.name}
                                      value={lga.name}
                                      onSelect={(value) => {
                                        handleChange("lga", value);
                                        setOpenLGAPopover(false);
                                      }}
                                    >
                                      {lga.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ward">Ward *</Label>
                      <Input
                        id="ward"
                        placeholder="e.g., Tudun Wada Ward"
                        value={form.ward}
                        onChange={(event) => handleChange("ward", event.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Adding your ward helps collectors know the exact catchment area you service.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Collection or processing address</Label>
                      <Textarea
                        id="address"
                        placeholder="House number, street, or processing centre"
                        value={form.address}
                        onChange={(event) => handleChange("address", event.target.value)}
                        rows={3}
                      />
                    </div>
                  </section>

                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">Verified payouts</Badge>
                    <Badge variant="outline">Ward-level coverage</Badge>
                    <Badge variant="outline">Secure wallet</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-end gap-3 border-t bg-muted/30">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setLocation("/vendors/login")}
                    disabled={mutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="px-6" disabled={mutation.isPending}>
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Complete setup"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          ) : (
            <Card className="py-16 px-8 text-center space-y-6">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-outfit text-2xl font-semibold">You are verified as a local vendor</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We are directing you to your vendor dashboard where you can manage collector confirmations, trigger payouts,
                and monitor your wallet balance in real time.
              </p>
              <Button onClick={() => setLocation("/vendors/dashboard")}>Go to dashboard now</Button>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
