import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Award, CheckCircle2, DollarSign, Leaf, Loader2, MapPin, ShieldCheck, Smartphone, Upload, Users } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { nigeriaStates } from "@/data/nigeriaStates";

interface CollectorProfileForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  state: string;
  lga: string;
  ward: string;
  city: string;
  address: string;
  preferredArea: string;
  idType: string;
  idNumber: string;
  bio: string;
}

type Step = 1 | 2 | 3;

export default function CollectorOnboarding() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [step, setStep] = useState<Step>(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [openStatePopover, setOpenStatePopover] = useState(false);
  const [openLGAPopover, setOpenLGAPopover] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [idDocumentData, setIdDocumentData] = useState<string>("");
  const [idDocumentName, setIdDocumentName] = useState("");

  const [profileForm, setProfileForm] = useState<CollectorProfileForm>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    state: "",
    lga: "",
    ward: "",
    city: "",
    address: "",
    preferredArea: "",
    idType: "",
    idNumber: "",
    bio: "",
  });

  const currentLGAs = useMemo(() => {
    const selectedState = nigeriaStates.find((state) => state.name === profileForm.state);
    return selectedState ? selectedState.lgas : [];
  }, [profileForm.state]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "collector") {
      setStep(3);
    }
  }, [authLoading, isAuthenticated, user]);

  const accountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/login", {
        username,
        password,
        role: "collector",
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onSuccess: () => {
      toast({
        title: "Account created",
        description: "Let’s complete your collector profile.",
      });
      setStep(2);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to create account.";
      toast({
        title: "Account creation failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const profileMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/collectors/profile", {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phoneNumber: profileForm.phoneNumber,
        email: profileForm.email,
        address: profileForm.address,
        city: profileForm.city,
        state: profileForm.state,
        lga: profileForm.lga,
        ward: profileForm.ward,
        preferredArea: profileForm.preferredArea,
        idType: profileForm.idType,
        idNumber: profileForm.idNumber,
        bio: profileForm.bio,
        location: locationCoords,
        ...(idDocumentData ? { idDocumentImage: idDocumentData } : {}),
      });

      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onSuccess: () => {
      toast({
        title: "Profile saved",
        description: "Redirecting you to your dashboard...",
      });
      setStep(3);
      setTimeout(() => setLocation("/collector"), 1500);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Unable to save profile.";
      toast({
        title: "Profile update failed",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleAccountSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast({
        title: "Missing credentials",
        description: "Please choose a username and password to continue.",
        variant: "destructive",
      });
      return;
    }

    accountMutation.mutate();
  };

  const handleProfileChange = (field: keyof CollectorProfileForm, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profileForm.firstName || !profileForm.lastName || !profileForm.phoneNumber) {
      toast({
        title: "Missing required information",
        description: "First name, last name, and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    if (!profileForm.state || !profileForm.lga) {
      toast({
        title: "Select your operating area",
        description: "Please choose your state and LGA to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Accept the terms",
        description: "You need to agree to the terms and conditions before continuing.",
        variant: "destructive",
      });
      return;
    }

    profileMutation.mutate();
  };

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location unavailable",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      () => {
        toast({
          title: "Unable to fetch location",
          description: "Allow location access and try again.",
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
    );
  };

  const handleIdImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setIdDocumentData("");
      setIdDocumentName("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setIdDocumentData(typeof reader.result === "string" ? reader.result : "");
      setIdDocumentName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const progressValue = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />
      <main className="flex-1 py-16 px-6">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
          <section className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Leaf className="h-4 w-4" /> Collector Onboarding
            </div>
            <h1 className="font-outfit text-3xl font-extrabold md:text-4xl">Join the Waste2Wealth collector network</h1>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Create your trusted profile, unlock instant KOBO payouts, and partner with verified vendors and factories across Nigeria.
            </p>
          </section>

          <Card className="shadow-xl">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <Users className="h-5 w-5" /> Step {step} of 3
              </CardTitle>
              <CardDescription className="flex flex-col gap-1 text-muted-foreground">
                <span>{step === 1 && "Create your collector account credentials."}</span>
                <span>{step === 2 && "Add the details vendors use to verify your drops."}</span>
                <span>{step === 3 && "Profile complete. You are ready to start collecting."}</span>
              </CardDescription>
              <Progress value={progressValue} className="h-2" />
            </CardHeader>

            <CardContent className="space-y-10">
              {step === 1 && (
                <form onSubmit={handleAccountSubmit} className="mx-auto flex max-w-md flex-col gap-6">
                  <div className="space-y-2 text-center">
                    <h2 className="text-xl font-semibold">Create your collector account</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose a unique username and secure password to access your dashboard.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="e.g. greenhero123"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-2" disabled={accountMutation.isPending}>
                    {accountMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {accountMutation.isPending ? "Creating account..." : "Continue to profile"}
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleProfileSubmit} className="space-y-8">
                  <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-8">
                      <section className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          <Users className="h-3.5 w-3.5" /> Personal details
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First name *</Label>
                            <Input
                              id="firstName"
                              value={profileForm.firstName}
                              onChange={(event) => handleProfileChange("firstName", event.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last name *</Label>
                            <Input
                              id="lastName"
                              value={profileForm.lastName}
                              onChange={(event) => handleProfileChange("lastName", event.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">Phone number *</Label>
                            <Input
                              id="phoneNumber"
                              value={profileForm.phoneNumber}
                              onChange={(event) => handleProfileChange("phoneNumber", event.target.value)}
                              placeholder="e.g. +2348100000000"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profileForm.email}
                              onChange={(event) => handleProfileChange("email", event.target.value)}
                              placeholder="you@example.com"
                            />
                          </div>
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <MapPin className="h-3.5 w-3.5" /> Operating area
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>State *</Label>
                            <Popover open={openStatePopover} onOpenChange={setOpenStatePopover}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between">
                                  {profileForm.state || "Select state"}
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
                                            handleProfileChange("state", value);
                                            handleProfileChange("lga", "");
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
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={profileForm.city}
                              onChange={(event) => handleProfileChange("city", event.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>LGA *</Label>
                            <Popover open={openLGAPopover} onOpenChange={setOpenLGAPopover}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between" disabled={!currentLGAs.length}>
                                  {profileForm.lga || "Select LGA"}
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
                                            handleProfileChange("lga", value);
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
                          <div className="space-y-2">
                            <Label htmlFor="ward">Ward / Community</Label>
                            <Input
                              id="ward"
                              value={profileForm.ward}
                              onChange={(event) => handleProfileChange("ward", event.target.value)}
                              placeholder="e.g. Tudun Wada"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Residential address</Label>
                          <Textarea
                            id="address"
                            value={profileForm.address}
                            onChange={(event) => handleProfileChange("address", event.target.value)}
                            placeholder="House number, street, community"
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preferredArea">Preferred collection area</Label>
                          <Input
                            id="preferredArea"
                            value={profileForm.preferredArea}
                            onChange={(event) => handleProfileChange("preferredArea", event.target.value)}
                            placeholder="Ikeja, Victoria Island, Surulere..."
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="flex items-center gap-2">GPS location</Label>
                          <Button
                            type="button"
                            variant="outline"
                            className="justify-center gap-2"
                            onClick={handleGetLocation}
                            disabled={isGettingLocation}
                          >
                            {isGettingLocation ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" /> Capturing location...
                              </>
                            ) : (
                              <>
                                <MapPin className="h-4 w-4" /> Capture GPS location
                              </>
                            )}
                          </Button>
                          {locationCoords && (
                            <p className="text-xs text-muted-foreground">
                              Captured coordinates: lat {locationCoords.lat.toFixed(6)}, lng {locationCoords.lng.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                          <ShieldCheck className="h-3.5 w-3.5" /> Identity verification
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="idType">ID type</Label>
                            <Select value={profileForm.idType} onValueChange={(value) => handleProfileChange("idType", value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select ID type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="national_id">National ID Card</SelectItem>
                                <SelectItem value="voters_card">Voter's Card</SelectItem>
                                <SelectItem value="drivers_license">Driver's License</SelectItem>
                                <SelectItem value="nin">NIN Slip</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="idNumber">ID number</Label>
                            <Input
                              id="idNumber"
                              value={profileForm.idNumber}
                              onChange={(event) => handleProfileChange("idNumber", event.target.value)}
                              placeholder="Enter the ID number"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="idUpload" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" /> Upload supporting document
                          </Label>
                          <Input
                            id="idUpload"
                            type="file"
                            accept="image/png,image/jpeg,application/pdf"
                            onChange={handleIdImageUpload}
                          />
                          {idDocumentName ? (
                            <div className="flex items-center justify-between rounded-md border border-dashed border-emerald-300 bg-emerald-50 px-3 py-2 text-sm dark:border-emerald-700 dark:bg-emerald-950">
                              <span className="truncate">{idDocumentName}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setIdDocumentData("");
                                  setIdDocumentName("");
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Accepted formats: JPG, PNG, or PDF (max 5MB).</p>
                          )}
                        </div>
                      </section>

                      <section className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          <Smartphone className="h-3.5 w-3.5" /> About you
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Tell vendors about yourself</Label>
                          <Textarea
                            id="bio"
                            rows={4}
                            value={profileForm.bio}
                            onChange={(event) => handleProfileChange("bio", event.target.value)}
                            placeholder="Share your collection experience, schedule, and the value you bring to partners."
                          />
                          <p className="text-xs text-muted-foreground">A strong bio increases your chances of receiving verified requests.</p>
                        </div>
                      </section>

                      <section className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                          <ShieldCheck className="h-3.5 w-3.5" /> Terms &amp; compliance
                        </div>
                        <div className="flex items-start gap-3 rounded-xl border border-muted bg-muted/30 p-4">
                          <Checkbox
                            id="terms"
                            checked={acceptTerms}
                            onCheckedChange={(value) => setAcceptTerms(Boolean(value))}
                            className="mt-1"
                          />
                          <div className="space-y-2 text-sm">
                            <Label htmlFor="terms" className="font-medium">
                              I agree to the Terms &amp; Conditions and Privacy Policy
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              By continuing, you accept our {" "}
                              <Link href="/terms" className="text-primary underline">
                                Terms &amp; Conditions
                              </Link>{" "}
                              and {" "}
                              <Link href="/privacy" className="text-primary underline">
                                Privacy Policy
                              </Link>. Your data is protected under NDPR requirements.
                            </p>
                          </div>
                        </div>
                      </section>
                    </div>

                    <aside className="flex flex-col gap-6 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-left dark:border-emerald-800 dark:bg-emerald-950/60">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-200">
                          Why collectors choose Waste2Wealth
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Verified vendors, instant settlements, and measurable impact tracking in one dashboard.
                        </p>
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                          <DollarSign className="mt-1 h-4 w-4 text-emerald-500" />
                          <span>Instant KOBO payouts once drops are verified by partner vendors.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <Award className="mt-1 h-4 w-4 text-amber-500" />
                          <span>Leaderboard recognition and quarterly performance rewards.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="mt-1 h-4 w-4 text-emerald-500" />
                          <span>Compliance support keeps you NDPR-ready and trusted by partners.</span>
                        </div>
                      </div>
                    </aside>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-muted pt-6 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-muted-foreground">
                      Double-check your details — vendors rely on accurate information for payouts and pickups.
                    </p>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button type="submit" className="gap-2" disabled={profileMutation.isPending}>
                        {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {profileMutation.isPending ? "Saving profile..." : "Submit profile"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {step === 3 && (
                <div className="space-y-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">You're all set!</h2>
                    <p className="text-muted-foreground">
                      Your collector profile is verified. You can now access the dashboard to accept jobs and track rewards.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button className="gap-2" onClick={() => setLocation("/collector")}>
                      Go to dashboard
                    </Button>
                    <Button variant="outline" onClick={() => setLocation("/")}>
                      Explore public site
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-left">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Verified network</h3>
              <p className="text-sm text-muted-foreground">Match with vendors and factories that already trust Waste2Wealth collectors.</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-left dark:border-emerald-700 dark:bg-emerald-950">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-100">
                <Leaf className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Impact metrics</h3>
              <p className="text-sm text-muted-foreground">Track the waste you divert from landfills and the CO₂ you help offset.</p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 text-left dark:border-blue-800 dark:bg-blue-950">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                <DollarSign className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">Instant payouts</h3>
              <p className="text-sm text-muted-foreground">Receive KOBO credits the moment your collection is verified by our partners.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
