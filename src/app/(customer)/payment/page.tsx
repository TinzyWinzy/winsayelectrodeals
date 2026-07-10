"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, Building, Landmark, Smartphone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getQuoteByQuoteId, updateQuote, createPayment } from "@/lib/db";
import { formatUsd, formatZig } from "@/lib/utils";
import { getUsdToZigRate } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { Quote, PaymentMethod } from "@/types";

const paymentMethods: {
  id: PaymentMethod;
  label: string;
  icon: typeof Wallet;
  description: string;
}[] = [
  {
    id: "paynow",
    label: "PayNow",
    icon: Smartphone,
    description: "EcoCash, Telecash, OneMoney",
  },
  {
    id: "ecocash",
    label: "EcoCash",
    icon: Smartphone,
    description: "Pay with EcoCash mobile money",
  },
  {
    id: "innbucks",
    label: "InnBucks",
    icon: Building,
    description: "Pay at any InnBucks till point",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    icon: Landmark,
    description: "Direct bank deposit or EFT",
  },
];

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteDocId = searchParams.get("quote");
  const quoteId = searchParams.get("quoteId");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [zigRate, setZigRate] = useState(400);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("paynow");
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!quoteId) return;
      try {
        const [q, rate] = await Promise.all([
          getQuoteByQuoteId(quoteId),
          getUsdToZigRate(),
        ]);
        setQuote(q);
        setZigRate(rate);
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quoteId]);

  const handlePay = async () => {
    if (!quote || !quoteDocId) return;
    setProcessing(true);
    setPaymentError(null);

    try {
      await createPayment({
        quoteId: quoteDocId,
        amountUsd: quote.depositUsd,
        amountZig: null,
        method: selectedMethod,
        transactionRef: null,
        status: "pending",
      });

      await updateQuote(quoteDocId, {
        paymentMethod: selectedMethod,
      } as Record<string, unknown>);

      if (selectedMethod === "paynow") {
        const res = await fetch("/api/payment/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            quoteId: quote.quoteId,
            amount: quote.depositUsd,
            email: "payments@winsay.co.zw",
          }),
        });

        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }

      router.push(`/confirmation?quote=${quoteDocId}&quoteId=${quote.quoteId}`);
    } catch (err) {
      setPaymentError(
        err instanceof Error
          ? err.message
          : "Payment processing failed. Please try again."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-medium">Quote not found</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-primary hover:border-gray-300 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-primary">Payment</h1>
            <p className="text-sm text-gray-500">Quote {quote.quoteId}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary-light text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-white/70" />
                <p className="text-sm text-white/70">Amount Due</p>
              </div>
              <p className="text-4xl font-bold tabular-nums tracking-tight">
                {formatUsd(quote.depositUsd)}
              </p>
              <p className="text-white/70 mt-1 tabular-nums">
                ≈ {formatZig(quote.depositUsd * zigRate)}
              </p>
              {quote.payAfterInstall && (
                <Badge variant="outline" className="mt-3 bg-white/10 text-white border-white/20">
                  Deposit Only
                </Badge>
              )}
            </CardContent>
          </Card>

          <div>
            <h3 className="text-sm font-semibold text-primary mb-3">
              Payment Method
            </h3>
            <div className="space-y-3" role="radiogroup" aria-label="Payment method">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    role="radio"
                    aria-checked={isSelected}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-primary/5"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                          isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-primary">{method.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {method.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="ml-auto w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedMethod === "bank_transfer" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h4 className="text-sm font-semibold text-primary mb-3">
                Bank Transfer Details
              </h4>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Bank</span>
                  <strong>CBZ Bank</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Account Name</span>
                  <strong>Winsay Electrodeals</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Account</span>
                  <strong className="font-mono">123-456-789-012</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500">Branch</span>
                  <strong>Harare Main</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-500">Reference</span>
                  <strong className="font-mono text-primary">{quote.quoteId}</strong>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                Please include your quote ID as reference. After transfer, upload proof of payment.
              </p>
            </motion.div>
          )}

          {paymentError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger"
            >
              {paymentError}
            </motion.div>
          )}

          <Button size="lg" className="w-full shadow-lg" onClick={handlePay} disabled={processing}>
            {processing ? "Processing..." : `Pay ${formatUsd(quote.depositUsd)} with ${paymentMethods.find(m => m.id === selectedMethod)?.label}`}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
