"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Download, Calendar, Share2, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getQuoteByQuoteId, getPackageById } from "@/lib/db";
import { formatUsd } from "@/lib/utils";
import type { Quote, Package } from "@/types";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId");

  const [quote, setQuote] = useState<Quote | null>(null);
  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!quoteId) {
        setLoading(false);
        return;
      }
      try {
        const q = await getQuoteByQuoteId(quoteId);
        setQuote(q);
        if (q) {
          const p = await getPackageById(q.packageId);
          setPkg(p);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [quoteId]);

  const handleDownloadInvoice = async () => {
    try {
      const res = await fetch(`/api/invoice/generate?quoteId=${quoteId}`);
      if (!res.ok) {
        setDownloadError("Failed to generate invoice. Please try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${quoteId}.html`;
      a.click();
      URL.revokeObjectURL(url);
      setDownloadError(null);
    } catch {
      setDownloadError("Failed to download invoice. Please try again.");
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello! I have generated a solar quote with Winsay Electrodeals.\n\nQuote ID: ${quoteId}\nAmount: ${quote ? formatUsd(quote.totalUsd) : ""}\nPackage: ${pkg?.name || ""}\n\nTrack your quote: ${window.location.origin}/confirmation?quoteId=${quoteId}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-success to-green-500 shadow-lg mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6 max-w-md mx-auto"
        >
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            Quote Submitted Successfully!
          </h1>

          <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
            <FileText className="w-4 h-4 text-primary/60" />
            <span className="text-sm text-gray-500">Quote ID:</span>
            <span className="text-sm font-bold text-primary font-mono">
              {quoteId}
            </span>
          </div>

          <Card className="border-0 shadow-lg text-left">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Package</span>
                <span className="text-sm font-semibold">{pkg?.name || "-"}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold tabular-nums text-primary">
                  {quote ? formatUsd(quote.totalUsd) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Deposit Due</span>
                <span className="text-base font-semibold tabular-nums">
                  {quote ? formatUsd(quote.depositUsd) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Status</span>
                <Badge variant="warning">Pending Payment</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 bg-amber-50 rounded-lg p-3 border border-amber-100">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Estimated installation within 48 hours of deposit payment</span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={handleDownloadInvoice} variant="outline" size="md">
              <Download className="w-4 h-4" />
              Download Invoice
            </Button>
            <Button onClick={handleWhatsAppShare} variant="outline" size="md">
              <Share2 className="w-4 h-4" />
              Share via WhatsApp
            </Button>
            {downloadError && (
              <p className="text-sm text-danger text-center">{downloadError}</p>
            )}
          </div>

          <div className="pt-4">
            <p className="text-xs text-gray-400 mb-3">
              For a faster experience, add this app to your home screen.
            </p>
            <Button onClick={() => router.push("/")} variant="ghost" size="md">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
