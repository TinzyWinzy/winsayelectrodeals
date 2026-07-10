"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-danger/10 mb-6">
          <AlertTriangle className="w-8 h-8 text-danger" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={reset} variant="primary">
          Try Again
        </Button>
      </motion.div>
    </div>
  );
}
