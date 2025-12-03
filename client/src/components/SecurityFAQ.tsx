import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Zap, AlertCircle, CheckCircle2, Eye, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FAQItem {
  question: string;
  answer: string;
  icon: any;
}

export function SecurityFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: "How is my KOBO wallet secured?",
      answer: "Your KOBO wallet uses bank-grade encryption (AES-256) and multi-factor authentication. All transactions require biometric or PIN verification. Your private keys are stored securely on your device and never transmitted to our servers.",
      icon: Lock
    },
    {
      question: "How fast are instant payouts?",
      answer: "Once a factory verifies your waste delivery, KOBO tokens are credited to your wallet within 30 seconds. You can instantly convert KOBO to Naira and withdraw to your linked bank account within 2-5 minutes.",
      icon: Zap
    },
    {
      question: "What fraud prevention measures are in place?",
      answer: "We use AI-powered verification, blockchain-backed transaction records, barcode authentication for waste tracking, real-time monitoring of suspicious activities, and mandatory KYC verification for all users. Factories must verify waste quality before payment is released.",
      icon: Shield
    },
    {
      question: "Is my personal data protected?",
      answer: "Yes. We comply with NDPR (Nigeria Data Protection Regulation) and GDPR standards. Your data is encrypted end-to-end, never sold to third parties, and you can export or delete your data anytime from your dashboard.",
      icon: Eye
    },
    {
      question: "What happens if a transaction fails?",
      answer: "If a transaction fails, your KOBO tokens are automatically refunded within 1 hour. You'll receive instant notifications via SMS and in-app alerts. Our 24/7 support team can manually resolve any issues within 2 hours.",
      icon: AlertCircle
    },
    {
      question: "How are bank accounts verified?",
      answer: "We use CBN-approved payment processors (Paystack, Flutterwave) for bank verification. A small test deposit (₦10) is made to confirm account ownership, which is instantly refunded. All bank details are encrypted and PCI-DSS compliant.",
      icon: CreditCard
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-4">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              SECURITY & TRUST
            </span>
          </div>
          <h2 className="font-outfit font-bold text-4xl md:text-5xl mb-4">
            Your Safety Is Our Priority
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Learn how we protect your money, data, and transactions with industry-leading security measures.
          </p>
        </div>

        {/* Security Features Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "256-bit Encryption", icon: Lock },
            { label: "2FA Protected", icon: Shield },
            { label: "<30s Payouts", icon: Zap },
            { label: "24/7 Monitoring", icon: Eye }
          ].map((feature, idx) => (
            <div key={idx} className="bg-muted/50 rounded-lg p-4 text-center border border-border hover:border-primary/50 transition-all">
              <feature.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">{feature.label}</p>
            </div>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card 
              key={index}
              className={`cursor-pointer transition-all duration-300 ${
                openIndex === index ? 'border-primary shadow-lg' : 'hover:border-primary/50'
              }`}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center flex-shrink-0 ${
                    openIndex === index ? 'scale-110' : ''
                  } transition-transform`}>
                    <faq.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold flex items-center justify-between">
                      {faq.question}
                      <span className={`text-2xl transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                        ↓
                      </span>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              {openIndex === index && (
                <CardContent className="pt-0 pl-14 animate-slide-down">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Trust Seals */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            <img src="/api/placeholder/120/60" alt="PCI DSS Compliant" className="h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/api/placeholder/120/60" alt="SSL Secured" className="h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/api/placeholder/120/60" alt="NDPR Compliant" className="h-12 opacity-60 hover:opacity-100 transition-opacity" />
            <img src="/api/placeholder/120/60" alt="CBN Licensed" className="h-12 opacity-60 hover:opacity-100 transition-opacity" />
          </div>
          <Button variant="outline" size="lg" className="group">
            View Full Security Documentation
            <CheckCircle2 className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
