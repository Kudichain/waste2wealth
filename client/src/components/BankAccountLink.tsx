import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle,
  Loader2,
  Shield,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank", code: "023" },
  { name: "Ecobank Nigeria", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "Union Bank of Nigeria", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

interface BankAccountLinkProps {
  onSuccess?: () => void;
  existingAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    verified: boolean;
  };
}

export function BankAccountLink({ onSuccess, existingAccount }: BankAccountLinkProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(!existingAccount);
  const [isVerifying, setIsVerifying] = useState(false);
  const [formData, setFormData] = useState({
    bankName: existingAccount?.bankName || "",
    bankCode: "",
    accountNumber: existingAccount?.accountNumber || "",
    accountName: existingAccount?.accountName || "",
  });
  const [isVerified, setIsVerified] = useState(existingAccount?.verified || false);

  const handleBankChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBank = NIGERIAN_BANKS.find(b => b.name === e.target.value);
    setFormData({
      ...formData,
      bankName: e.target.value,
      bankCode: selectedBank?.code || "",
    });
  };

  const handleVerifyAccount = async () => {
    if (!formData.bankName || !formData.accountNumber) {
      toast({
        title: "Missing Information",
        description: "Please select a bank and enter account number",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    // Simulate API call to verify account
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock account name resolution
    const mockAccountName = `${formData.accountNumber.slice(0, 3)} **** ${formData.accountNumber.slice(-3)} Account Holder`;
    
    setFormData({
      ...formData,
      accountName: mockAccountName,
    });
    setIsVerified(true);
    setIsVerifying(false);

    toast({
      title: "Account Verified! ✅",
      description: "Your bank account has been successfully verified.",
    });
  };

  const handleSave = async () => {
    if (!isVerified) {
      toast({
        title: "Verification Required",
        description: "Please verify your account before saving",
        variant: "destructive",
      });
      return;
    }

    // Simulate API call to save bank account
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Bank Account Linked! 🎉",
      description: "You can now receive payments directly to your bank account.",
    });

    setIsEditing(false);
    onSuccess?.();
  };

  if (existingAccount && !isEditing) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Bank Account Linked</CardTitle>
                <CardDescription>Your payments will be sent here</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">Verified</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Bank Name</p>
              <p className="font-semibold">{existingAccount.bankName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account Number</p>
              <p className="font-semibold">{existingAccount.accountNumber}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Account Name</p>
              <p className="font-semibold">{existingAccount.accountName}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsEditing(true)}
          >
            Update Bank Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">Link Bank Account</CardTitle>
            <CardDescription>Receive payments directly to your bank</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
          <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100">Secure & Encrypted</p>
            <p className="text-blue-700 dark:text-blue-300">Your banking details are protected with bank-level encryption</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="bankName">Bank Name *</Label>
            <select
              id="bankName"
              value={formData.bankName}
              onChange={handleBankChange}
              className="w-full mt-1.5 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-800 dark:border-gray-600"
              disabled={isVerified}
            >
              <option value="">Select your bank</option>
              {NIGERIAN_BANKS.map((bank) => (
                <option key={bank.code} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="accountNumber">Account Number *</Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="0123456789"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              maxLength={10}
              disabled={isVerified}
              className="mt-1.5"
            />
          </div>

          {!isVerified && (
            <Button 
              onClick={handleVerifyAccount}
              disabled={!formData.bankName || formData.accountNumber.length !== 10 || isVerifying}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying Account...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Verify Account
                </>
              )}
            </Button>
          )}

          {isVerified && formData.accountName && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-900 dark:text-green-100">Account Verified</p>
              </div>
              <div className="space-y-1 text-sm">
                <p className="text-muted-foreground">Account Name:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{formData.accountName}</p>
              </div>
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={handleSave}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Save Bank Account
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsVerified(false);
                    setFormData({ ...formData, accountName: "" });
                  }}
                  className="w-full"
                >
                  Change Account
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-medium">Important:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Account name must match your ID verification</li>
              <li>Ensure account is active and can receive transfers</li>
              <li>You can update your account details anytime</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
