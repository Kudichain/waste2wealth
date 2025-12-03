import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Building2, Upload, CheckCircle2 } from "lucide-react";
import { nigeriaStates } from "@/data/nigeriaStates";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function RegisterFactory() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Company Information
    companyName: "",
    tradingName: "",
    registrationNumber: "",
    taxIdentificationNumber: "",
    incorporationDate: "",
    companyType: "",
    
    // Contact Information
    email: "",
    phoneNumber: "",
    alternativePhone: "",
    website: "",
    
    // Address Information
    streetAddress: "",
    city: "",
    state: "",
    lga: "",
    postalCode: "",
    country: "Nigeria",
    
    // Factory Details
    factoryName: "",
    factoryType: "",
    wasteTypes: [] as string[],
    processingCapacity: "",
    operationalHours: "",
    numberOfEmployees: "",
    yearEstablished: "",
    
    // Banking Information
    bankName: "",
    accountNumber: "",
    accountName: "",
    bvn: "",
    
    // Legal & Compliance
    environmentalPermit: "",
    fireServiceCertificate: "",
    cacDocument: "",
    tinCertificate: "",
    
    // Contact Person
    contactPersonName: "",
    contactPersonPosition: "",
    contactPersonEmail: "",
    contactPersonPhone: "",
    
    // Terms
    agreeToTerms: false,
    agreeToDataProcessing: false,
  });

  const [files, setFiles] = useState({
    cacDocument: null as File | null,
    environmentalPermit: null as File | null,
    fireServiceCertificate: null as File | null,
    tinCertificate: null as File | null,
    factoryImages: [] as File[],
  });

  const wasteTypeOptions = [
    "Plastic (PET, HDPE, LDPE, PP, PVC)",
    "Metal (Aluminum, Steel, Copper)",
    "Paper & Cardboard",
    "Glass",
    "Electronic Waste (E-waste)",
    "Organic/Biodegradable Waste",
    "Textiles",
    "Rubber & Tires",
    "Mixed Municipal Waste",
  ];

  const companyTypeOptions = [
    "Private Limited Company",
    "Public Limited Company",
    "Partnership",
    "Sole Proprietorship",
    "Cooperative Society",
    "Non-Governmental Organization (NGO)",
  ];

  const factoryTypeOptions = [
    "Recycling Facility",
    "Waste-to-Energy Plant",
    "Composting Facility",
    "Material Recovery Facility (MRF)",
    "Transfer Station",
    "Sorting & Aggregation Center",
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: keyof typeof files, file: File | File[] | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  const handleWasteTypeToggle = (wasteType: string) => {
    setFormData(prev => ({
      ...prev,
      wasteTypes: prev.wasteTypes.includes(wasteType)
        ? prev.wasteTypes.filter(t => t !== wasteType)
        : [...prev.wasteTypes, wasteType]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = [
      'companyName', 'registrationNumber', 'taxIdentificationNumber',
      'email', 'phoneNumber', 'streetAddress', 'city', 'state', 'lga',
      'factoryName', 'factoryType', 'processingCapacity', 'numberOfEmployees',
      'bankName', 'accountNumber', 'accountName', 'bvn',
      'contactPersonName', 'contactPersonPosition', 'contactPersonEmail', 'contactPersonPhone'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (formData.wasteTypes.length === 0) {
      alert('Please select at least one waste type you can process');
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToDataProcessing) {
      alert('Please agree to the terms and conditions and data processing policy');
      return;
    }

    // In a real application, this would submit to an API
    console.log('Form Data:', formData);
    console.log('Files:', files);
    
    alert('Factory registration submitted successfully! Our team will review your application and contact you within 3-5 business days.');
    setLocation('/');
  };

  const getCurrentLGAs = () => {
    const state = nigeriaStates.find(s => s.name === formData.state);
    return state ? state.lgas : [];
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="companyName">Legal Company Name *</Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              placeholder="As registered with CAC"
              required
            />
          </div>
          <div>
            <Label htmlFor="tradingName">Trading/Brand Name</Label>
            <Input
              id="tradingName"
              value={formData.tradingName}
              onChange={(e) => handleInputChange('tradingName', e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label htmlFor="registrationNumber">CAC Registration Number *</Label>
            <Input
              id="registrationNumber"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              placeholder="RC123456 or BN123456"
              required
            />
          </div>
          <div>
            <Label htmlFor="taxIdentificationNumber">Tax Identification Number (TIN) *</Label>
            <Input
              id="taxIdentificationNumber"
              value={formData.taxIdentificationNumber}
              onChange={(e) => handleInputChange('taxIdentificationNumber', e.target.value)}
              placeholder="12345678-0001"
              required
            />
          </div>
          <div>
            <Label htmlFor="incorporationDate">Date of Incorporation</Label>
            <Input
              id="incorporationDate"
              type="date"
              value={formData.incorporationDate}
              onChange={(e) => handleInputChange('incorporationDate', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="companyType">Company Type *</Label>
            <Select value={formData.companyType} onValueChange={(value) => handleInputChange('companyType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select company type" />
              </SelectTrigger>
              <SelectContent>
                {companyTypeOptions.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Official Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="info@company.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="phoneNumber">Primary Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              required
            />
          </div>
          <div>
            <Label htmlFor="alternativePhone">Alternative Phone Number</Label>
            <Input
              id="alternativePhone"
              type="tel"
              value={formData.alternativePhone}
              onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
              placeholder="+234 XXX XXX XXXX"
            />
          </div>
          <div>
            <Label htmlFor="website">Company Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.company.com"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Registered Office Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="streetAddress">Street Address *</Label>
            <Input
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(e) => handleInputChange('streetAddress', e.target.value)}
              placeholder="Building number, street name"
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City/Town *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State *</Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {nigeriaStates.map(state => (
                  <SelectItem key={state.name} value={state.name}>{state.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lga">Local Government Area *</Label>
            <Select 
              value={formData.lga} 
              onValueChange={(value) => handleInputChange('lga', value)}
              disabled={!formData.state}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select LGA" />
              </SelectTrigger>
              <SelectContent>
                {getCurrentLGAs().map(lga => (
                  <SelectItem key={lga.name} value={lga.name}>{lga.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setStep(2)} size="lg">
          Continue to Factory Details
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Factory/Facility Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="factoryName">Factory/Facility Name *</Label>
            <Input
              id="factoryName"
              value={formData.factoryName}
              onChange={(e) => handleInputChange('factoryName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="factoryType">Facility Type *</Label>
            <Select value={formData.factoryType} onValueChange={(value) => handleInputChange('factoryType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select facility type" />
              </SelectTrigger>
              <SelectContent>
                {factoryTypeOptions.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="processingCapacity">Processing Capacity (Tons/Month) *</Label>
            <Input
              id="processingCapacity"
              type="number"
              value={formData.processingCapacity}
              onChange={(e) => handleInputChange('processingCapacity', e.target.value)}
              placeholder="e.g., 100"
              required
            />
          </div>
          <div>
            <Label htmlFor="numberOfEmployees">Number of Employees *</Label>
            <Input
              id="numberOfEmployees"
              type="number"
              value={formData.numberOfEmployees}
              onChange={(e) => handleInputChange('numberOfEmployees', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="yearEstablished">Year Established</Label>
            <Input
              id="yearEstablished"
              type="number"
              value={formData.yearEstablished}
              onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
              placeholder="e.g., 2020"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>
          <div>
            <Label htmlFor="operationalHours">Operational Hours</Label>
            <Input
              id="operationalHours"
              value={formData.operationalHours}
              onChange={(e) => handleInputChange('operationalHours', e.target.value)}
              placeholder="e.g., 8:00 AM - 5:00 PM, Mon-Sat"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Waste Types Accepted *</h3>
        <p className="text-sm text-muted-foreground mb-3">Select all types of waste your facility can process</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wasteTypeOptions.map(wasteType => (
            <div key={wasteType} className="flex items-center space-x-2">
              <Checkbox
                id={wasteType}
                checked={formData.wasteTypes.includes(wasteType)}
                onCheckedChange={() => handleWasteTypeToggle(wasteType)}
              />
              <Label htmlFor={wasteType} className="text-sm font-normal cursor-pointer">
                {wasteType}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={() => setStep(1)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setStep(3)} size="lg">
          Continue to Banking Information
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Banking Information</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Required for payment processing and KOBO wallet integration
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bankName">Bank Name *</Label>
            <Select value={formData.bankName} onValueChange={(value) => handleInputChange('bankName', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Access Bank">Access Bank</SelectItem>
                <SelectItem value="Ecobank">Ecobank</SelectItem>
                <SelectItem value="Fidelity Bank">Fidelity Bank</SelectItem>
                <SelectItem value="First Bank">First Bank</SelectItem>
                <SelectItem value="GTBank">GTBank</SelectItem>
                <SelectItem value="Keystone Bank">Keystone Bank</SelectItem>
                <SelectItem value="Polaris Bank">Polaris Bank</SelectItem>
                <SelectItem value="Stanbic IBTC">Stanbic IBTC</SelectItem>
                <SelectItem value="Sterling Bank">Sterling Bank</SelectItem>
                <SelectItem value="UBA">UBA</SelectItem>
                <SelectItem value="Union Bank">Union Bank</SelectItem>
                <SelectItem value="Unity Bank">Unity Bank</SelectItem>
                <SelectItem value="Wema Bank">Wema Bank</SelectItem>
                <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              value={formData.accountNumber}
              onChange={(e) => handleInputChange('accountNumber', e.target.value)}
              placeholder="10-digit account number"
              maxLength={10}
              required
            />
          </div>
          <div>
            <Label htmlFor="accountName">Account Name *</Label>
            <Input
              id="accountName"
              value={formData.accountName}
              onChange={(e) => handleInputChange('accountName', e.target.value)}
              placeholder="As registered with bank"
              required
            />
          </div>
          <div>
            <Label htmlFor="bvn">Bank Verification Number (BVN) *</Label>
            <Input
              id="bvn"
              value={formData.bvn}
              onChange={(e) => handleInputChange('bvn', e.target.value)}
              placeholder="11-digit BVN"
              maxLength={11}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Contact Person Details</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Primary contact for application follow-up and account management
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactPersonName">Full Name *</Label>
            <Input
              id="contactPersonName"
              value={formData.contactPersonName}
              onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPersonPosition">Position/Title *</Label>
            <Input
              id="contactPersonPosition"
              value={formData.contactPersonPosition}
              onChange={(e) => handleInputChange('contactPersonPosition', e.target.value)}
              placeholder="e.g., CEO, Operations Manager"
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPersonEmail">Email Address *</Label>
            <Input
              id="contactPersonEmail"
              type="email"
              value={formData.contactPersonEmail}
              onChange={(e) => handleInputChange('contactPersonEmail', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="contactPersonPhone">Phone Number *</Label>
            <Input
              id="contactPersonPhone"
              type="tel"
              value={formData.contactPersonPhone}
              onChange={(e) => handleInputChange('contactPersonPhone', e.target.value)}
              placeholder="+234 XXX XXX XXXX"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={() => setStep(2)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={() => setStep(4)} size="lg">
          Continue to Document Upload
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Required Documents
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please upload clear, legible copies of the following documents (PDF, JPG, or PNG format, max 5MB each)
        </p>
        
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors">
            <Label htmlFor="cacDocument" className="font-semibold mb-2 block">
              CAC Certificate of Incorporation *
            </Label>
            <Input
              id="cacDocument"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('cacDocument', e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {files.cacDocument && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> {files.cacDocument.name}
              </p>
            )}
          </div>

          <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors">
            <Label htmlFor="tinCertificate" className="font-semibold mb-2 block">
              Tax Identification Number (TIN) Certificate *
            </Label>
            <Input
              id="tinCertificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('tinCertificate', e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {files.tinCertificate && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> {files.tinCertificate.name}
              </p>
            )}
          </div>

          <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors">
            <Label htmlFor="environmentalPermit" className="font-semibold mb-2 block">
              Environmental Permit/License (if applicable)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Required for waste processing facilities - issued by NESREA or State Environmental Agency
            </p>
            <Input
              id="environmentalPermit"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('environmentalPermit', e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {files.environmentalPermit && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> {files.environmentalPermit.name}
              </p>
            )}
          </div>

          <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors">
            <Label htmlFor="fireServiceCertificate" className="font-semibold mb-2 block">
              Fire Service Safety Certificate (if applicable)
            </Label>
            <Input
              id="fireServiceCertificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange('fireServiceCertificate', e.target.files?.[0] || null)}
              className="cursor-pointer"
            />
            {files.fireServiceCertificate && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> {files.fireServiceCertificate.name}
              </p>
            )}
          </div>

          <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors">
            <Label htmlFor="factoryImages" className="font-semibold mb-2 block">
              Factory/Facility Photos (Optional)
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload photos of your facility, equipment, and operations (up to 5 images)
            </p>
            <Input
              id="factoryImages"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFileChange('factoryImages', Array.from(e.target.files || []))}
              className="cursor-pointer"
            />
            {files.factoryImages.length > 0 && (
              <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> {files.factoryImages.length} image(s) selected
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Terms and Conditions</h3>
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeToTerms"
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
            />
            <Label htmlFor="agreeToTerms" className="text-sm font-normal leading-relaxed cursor-pointer">
              I certify that all information provided is accurate and complete. I understand that providing false information may result in rejection of this application or termination of services. I agree to comply with all applicable environmental regulations and waste management standards. *
            </Label>
          </div>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agreeToDataProcessing"
              checked={formData.agreeToDataProcessing}
              onCheckedChange={(checked) => handleInputChange('agreeToDataProcessing', checked)}
            />
            <Label htmlFor="agreeToDataProcessing" className="text-sm font-normal leading-relaxed cursor-pointer">
              I consent to the processing of my personal and business data in accordance with the Nigeria Data Protection Regulation (NDPR) and understand that my information will be used for verification, account management, and platform operations. *
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={() => setStep(3)} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          size="lg"
          className="bg-primary hover:bg-primary/90"
        >
          Submit Application
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-gray-50 to-white">
      <Header />
      
      <main className="flex-1 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <h1 className="text-4xl font-bold mb-2">Factory Registration</h1>
            <p className="text-muted-foreground text-lg">
              Join our network of waste processing partners and contribute to a cleaner Nigeria
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3, 4].map((stepNum) => (
                <div key={stepNum} className="flex items-center flex-1">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    step >= stepNum 
                      ? 'bg-primary border-primary text-white' 
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    {step > stepNum ? <CheckCircle2 className="h-5 w-5" /> : stepNum}
                  </div>
                  {stepNum < 4 && (
                    <div className={`flex-1 h-1 mx-2 ${
                      step > stepNum ? 'bg-primary' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 px-2">
              <span className="text-xs font-medium">Company Info</span>
              <span className="text-xs font-medium">Factory Details</span>
              <span className="text-xs font-medium">Banking & Contact</span>
              <span className="text-xs font-medium">Documents</span>
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle>
                {step === 1 && "Step 1: Company Information"}
                {step === 2 && "Step 2: Factory/Facility Details"}
                {step === 3 && "Step 3: Banking & Contact Information"}
                {step === 4 && "Step 4: Document Upload & Confirmation"}
              </CardTitle>
              <CardDescription>
                {step === 1 && "Please provide accurate information as registered with CAC"}
                {step === 2 && "Tell us about your waste processing facility"}
                {step === 3 && "Required for payment processing and communication"}
                {step === 4 && "Upload required documents to complete your registration"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold mb-2 text-blue-900">Need Help?</h3>
            <p className="text-sm text-blue-800 mb-3">
              If you have any questions about the registration process or required documents, our support team is here to assist you.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-900">Email:</span>{" "}
                <a href="mailto:factory@motech.com" className="text-blue-600 hover:underline">
                  factory@motech.com
                </a>
              </div>
              <div>
                <span className="font-medium text-blue-900">Phone:</span>{" "}
                <a href="tel:+2348000000000" className="text-blue-600 hover:underline">
                  +234 800 000 0000
                </a>
              </div>
              <div>
                <span className="font-medium text-blue-900">WhatsApp:</span>{" "}
                <a href="https://wa.me/2348000000000" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  +234 800 000 0000
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
