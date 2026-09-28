"use client";

import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900">System Unavailable</h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              We encountered an unexpected error initializing the portal. Please reload or check back shortly.
            </p>
            {error.digest && (
              <p className="text-[10px] font-mono text-slate-400">
                Digest: {error.digest}
              </p>
            )}
          </div>

          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
