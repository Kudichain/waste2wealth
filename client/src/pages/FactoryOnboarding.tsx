import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Factory, Loader2, ShieldCheck, Upload, FileCheck, TrendingUp, Zap, Package, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { nigeriaStates } from "@/data/nigeriaStates";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface FactoryProfileForm {
  facilityName: string;
  companyName: string;
  registrationNumber: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  lga: string;
  processingCapacity: string;
  wasteTypesNeeded: string[];
  certifications: string[];
  operatingShifts: string;
  complianceStatus: string;
  qualityStandards: string;
  bio: string;
}

export default function FactoryOnboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [complianceCert, setComplianceCert] = useState<File | null>(null);
  const [compliancePreview, setCompliancePreview] = useState<string>("");
  const [environmentalCert, setEnvironmentalCert] = useState<File | null>(null);
  const [environmentalPreview, setEnvironmentalPreview] = useState<string>("");
  const [openStatePopover, setOpenStatePopover] = useState(false);
  const [openLGAPopover, setOpenLGAPopover] = useState(false);
  
  const [profileForm, setProfileForm] = useState<FactoryProfileForm>({
    facilityName: "",
    companyName: "",
    registrationNumber: "",
    contactName: "",
    email: "",
    phoneNumber: "",
    address: "",
    state: "",
    lga: "",
    processingCapacity: "",
    wasteTypesNeeded: [],
    certifications: [],
    operatingShifts: "",
    complianceStatus: "",
    qualityStandards: "",
    bio: "",
  });

  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const currentLGAs = useMemo(() => {
    const selectedState = nigeriaStates.find((state) => state.name === profileForm.state);
    return selectedState ? selectedState.lgas : [];
  }, [profileForm.state]);

  const handleProfileChange = (field: keyof FactoryProfileForm, value: string | string[]) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleWasteTypeToggle = (type: string) => {
    setProfileForm((prev) => ({
      ...prev,
      wasteTypesNeeded: prev.wasteTypesNeeded.includes(type)
        ? prev.wasteTypesNeeded.filter(t => t !== type)
        : [...prev.wasteTypesNeeded, type]
    }));
  };

  const handleCertificationToggle = (cert: string) => {
    setProfileForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'compliance' | 'environmental') => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'compliance') {
          setComplianceCert(file);
          setCompliancePreview(reader.result as string);
        } else {
          setEnvironmentalCert(file);
          setEnvironmentalPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAccountSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username to continue.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleProfileSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!acceptTerms) {
      toast({
        title: "Terms required",
        description: "Please accept the terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    setStep(3);
    toast({
      title: "Registration completed",
      description: "Redirecting you to your factory dashboard...",
    });
    setTimeout(() => {
      setLocation("/factory");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          {step === 1 && (
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900 mb-6">
                <Factory className="h-10 w-10 text-purple-600 dark:text-purple-300" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-outfit mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Register Your Processing Facility
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Access reliable waste supply, streamline logistics, and contribute to a circular economy
              </p>

              {/* Trust Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950">
                  <CardContent className="pt-6 text-center">
                    <Zap className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Efficient Supply Chain</h3>
                    <p className="text-sm text-muted-foreground">Direct vendor connections</p>
                  </CardContent>
                </Card>
                <Card className="border-indigo-200 bg-indigo-50 dark:bg-indigo-950">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Scale Operations</h3>
                    <p className="text-sm text-muted-foreground">Grow processing capacity</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 bg-green-50 dark:bg-green-950">
                  <CardContent className="pt-6 text-center">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Compliance Tracking</h3>
                    <p className="text-sm text-muted-foreground">Automated reporting</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          s === step
                            ? "bg-purple-600 text-white"
                            : s < step
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                      </div>
                      {s < 3 && (
                        <div
                          className={`h-1 w-12 mx-2 ${
                            s < step ? "bg-green-600" : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Progress value={(step / 3) * 100} className="w-32" />
              </div>
              <CardTitle className="text-2xl">
                {step === 1 && "Create Facility Account"}
                {step === 2 && "Facility Information"}
                {step === 3 && "Welcome Aboard!"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Choose a unique username for your facility"}
                {step === 2 && "Tell us about your processing capabilities"}
                {step === 3 && "Your factory account is ready"}
              </CardDescription>
            </CardHeader>

            {/* Step 1: Username */}
            {step === 1 && (
              <form onSubmit={handleAccountSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="username">Facility Username *</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="e.g., ecoprocess_factory"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be your unique identifier on the platform
                    </p>
                  </div>
                </CardContent>
                <div className="flex justify-end px-6 py-4 border-t bg-muted/30">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Continue
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Facility Profile */}
            {step === 2 && (
              <form onSubmit={handleProfileSubmit}>
                <CardContent className="space-y-8">
                  {/* Facility Details */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-1 bg-purple-600 rounded-full"></div>
                      <h3 className="font-semibold text-lg">Facility Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="facilityName">Facility Name *</Label>
                        <Input
                          id="facilityName"
                          value={profileForm.facilityName}
                          onChange={(e) => handleProfileChange("facilityName", e.target.value)}
                          placeholder="Processing facility name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Parent Company *</Label>
                        <Input
                          id="companyName"
                          value={profileForm.companyName}
                          onChange={(e) => handleProfileChange("companyName", e.target.value)}
                          placeholder="Registered company name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">CAC Registration No. *</Label>
                        <Input
                          id="registrationNumber"
                          value={profileForm.registrationNumber}
                          onChange={(e) => handleProfileChange("registrationNumber", e.target.value)}
                          placeholder="Company registration number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactName">Contact Person *</Label>
                        <Input
                          id="contactName"
                          value={profileForm.contactName}
                          onChange={(e) => handleProfileChange("contactName", e.target.value)}
                          placeholder="Full name"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Processing Capacity */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-1 bg-indigo-600 rounded-full"></div>
                      <h3 className="font-semibold text-lg">Processing Capacity</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="processingCapacity">Monthly Capacity (tons) *</Label>
                        <Input
                          id="processingCapacity"
                          value={profileForm.processingCapacity}
                          onChange={(e) => handleProfileChange("processingCapacity", e.target.value)}
                          placeholder="e.g., 500"
                          type="number"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="operatingShifts">Operating Shifts *</Label>
                        <Select
                          value={profileForm.operatingShifts}
                          onValueChange={(value) => handleProfileChange("operatingShifts", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select shifts" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single Shift (8 hours)</SelectItem>
                            <SelectItem value="double">Double Shift (16 hours)</SelectItem>
                            <SelectItem value="triple">24/7 Operations</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Waste Types Needed */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-1 bg-green-600 rounded-full"></div>
                      <h3 className="font-semibold text-lg">Waste Types Processed</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {["Plastic", "Metal", "Glass", "Paper", "E-Waste", "Organic", "Textile", "Rubber"].map((type) => (
                        <div key={type} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                             onClick={() => handleWasteTypeToggle(type)}>
                          <Checkbox
                            checked={profileForm.wasteTypesNeeded.includes(type)}
                            onCheckedChange={() => handleWasteTypeToggle(type)}
                          />
                          <Label className="cursor-pointer">{type}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                      <h3 className="font-semibold text-lg">Location</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>State *</Label>
                        <Popover open={openStatePopover} onOpenChange={setOpenStatePopover}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between">
                              {profileForm.state || "Select state"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-72">
                            <Command>
                              <CommandInput placeholder="Search states..." />
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
                        <Label>LGA *</Label>
                        <Popover open={openLGAPopover} onOpenChange={setOpenLGAPopover}>
                          <PopoverTrigger asChild>
                            <Button variant="outline" role="combobox" className="w-full justify-between" disabled={!currentLGAs.length}>
                              {profileForm.lga || "Select LGA"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="p-0 w-72">
                            <Command>
                              <CommandInput placeholder="Search LGAs..." />
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
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Facility Address *</Label>
                      <Textarea
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => handleProfileChange("address", e.target.value)}
                        placeholder="Full facility address"
                        rows={2}
                        required
                      />
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-1 bg-orange-600 rounded-full"></div>
                      <h3 className="font-semibold text-lg">Certifications & Compliance</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                      {["ISO 14001", "NESREA", "SON", "NAFDAC", "ISO 9001", "Other"].map((cert) => (
                        <div key={cert} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                             onClick={() => handleCertificationToggle(cert)}>
                          <Checkbox
                            checked={profileForm.certifications.includes(cert)}
                            onCheckedChange={() => handleCertificationToggle(cert)}
                          />
                          <Label className="cursor-pointer text-sm">{cert}</Label>
                        </div>
                      ))}
                    </div>

                    {/* Document Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Compliance Certificate</Label>
                        {compliancePreview ? (
                          <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                            <FileCheck className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-center text-green-700 dark:text-green-300">{complianceCert?.name}</p>
                            <Button type="button" variant="outline" size="sm" className="mt-2 w-full"
                                    onClick={() => { setComplianceCert(null); setCompliancePreview(""); }}>
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <Input type="file" id="complianceCert" accept=".pdf,.jpg,.jpeg,.png"
                                   onChange={(e) => handleFileUpload(e, 'compliance')} className="hidden" />
                            <Button type="button" variant="outline" size="sm"
                                    onClick={() => document.getElementById('complianceCert')?.click()}>
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Environmental Permit</Label>
                        {environmentalPreview ? (
                          <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 dark:bg-green-950">
                            <FileCheck className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <p className="text-sm text-center text-green-700 dark:text-green-300">{environmentalCert?.name}</p>
                            <Button type="button" variant="outline" size="sm" className="mt-2 w-full"
                                    onClick={() => { setEnvironmentalCert(null); setEnvironmentalPreview(""); }}>
                              Change
                            </Button>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <Input type="file" id="environmentalCert" accept=".pdf,.jpg,.jpeg,.png"
                                   onChange={(e) => handleFileUpload(e, 'environmental')} className="hidden" />
                            <Button type="button" variant="outline" size="sm"
                                    onClick={() => document.getElementById('environmentalCert')?.click()}>
                              Upload
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} required />
                    <Label htmlFor="terms" className="text-sm cursor-pointer">
                      I agree to the Factory Terms & Conditions and comply with environmental regulations
                    </Label>
                  </div>
                </CardContent>

                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t bg-muted/30">
                  <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="px-6 bg-purple-600 hover:bg-purple-700">
                    Complete Registration
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="py-16 px-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="font-outfit text-2xl font-semibold">Facility Registration Complete!</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Your processing facility is now registered. Start managing supply requests and tracking sustainability metrics.
                </p>
                <Button onClick={() => setLocation("/factory")} className="bg-purple-600 hover:bg-purple-700">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
