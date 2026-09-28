import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { AvailabilityStatus, VerificationStatus, RequestUrgency } from "@prisma/client";

interface StatusBadgeProps {
  status: AvailabilityStatus | VerificationStatus | RequestUrgency | string;
  type?: "availability" | "verification" | "urgency" | "general";
  className?: string;
}

export function StatusBadge({ status, type = "general", className }: StatusBadgeProps) {
  // 1. Availability Status
  if (type === "availability" || status in AvailabilityStatus) {
    switch (status) {
      case "AVAILABLE":
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200", className)}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Available Now
          </span>
        );
      case "TEMPORARILY_UNAVAILABLE":
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200", className)}>
            <Clock className="w-3.5 h-3.5" />
            Temporarily Unavailable
          </span>
        );
      case "NOT_AVAILABLE":
      case "INACTIVE":
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200", className)}>
            <XCircle className="w-3.5 h-3.5" />
            Not Available
          </span>
        );
      case "PENDING_VERIFICATION":
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200", className)}>
            <Clock className="w-3.5 h-3.5" />
            Verification Pending
          </span>
        );
    }
  }

  // 2. Verification Status
  if (type === "verification" || status in VerificationStatus) {
    switch (status) {
      case "APPROVED":
        return (
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800", className)}>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case "PENDING":
        return (
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-100 text-amber-800", className)}>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
      case "REJECTED":
        return (
          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800", className)}>
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
    }
  }

  // 3. Request Urgency
  if (type === "urgency" || status in RequestUrgency) {
    switch (status) {
      case "CRITICAL":
        return (
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs animate-pulse", className)}>
            <AlertTriangle className="w-3.5 h-3.5" />
            CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white", className)}>
            High Urgency
          </span>
        );
      case "MEDIUM":
        return (
          <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200", className)}>
            Medium
          </span>
        );
    }
  }

  // Default fallback
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800", className)}>
      {status}
    </span>
  );
}
