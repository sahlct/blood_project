"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, Home, Heart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error caught by root error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100 shadow-sm">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Connection or Service Notice
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The platform encountered a temporary service or database connection issue while loading this page.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-slate-400">
              Error Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="medical"
            size="lg"
            className="w-full sm:w-auto gap-2 font-bold cursor-pointer shadow-md shadow-red-600/20"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Button>

          <a href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto gap-2 font-bold border-slate-300"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </a>
        </div>

        <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 space-y-2">
          <p className="font-semibold text-slate-700">Need emergency blood assistance immediately?</p>
          <div className="flex items-center justify-center gap-2 font-bold text-red-600">
            <Phone className="w-4 h-4" />
            <span>24/7 Rapid Response Helpline: +91 98765 43210</span>
          </div>
        </div>
      </div>
    </div>
  );
}
