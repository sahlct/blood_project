import React from "react";
import { cn, formatDate } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

interface EligibilityIndicatorProps {
  isEligible: boolean;
  nextEligibleDate?: Date | string | null;
  lastDonationDate?: Date | string | null;
  reason?: string;
  showDisclaimer?: boolean;
  className?: string;
}

export function EligibilityIndicator({
  isEligible,
  nextEligibleDate,
  lastDonationDate,
  reason,
  showDisclaimer = true,
  className,
}: EligibilityIndicatorProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 border transition-all",
        isEligible
          ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
          : "bg-amber-50/60 border-amber-200 text-amber-900",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {isEligible ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        )}
        <div className="space-y-1 text-sm">
          <div className="font-semibold flex items-center gap-2">
            <span>{isEligible ? "May Be Eligible to Donate" : "Not Yet Eligible"}</span>
            {nextEligibleDate && !isEligible && (
              <span className="text-xs font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Eligible on {formatDate(nextEligibleDate)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {reason ||
              (isEligible
                ? "Based on your last recorded donation date, you may be eligible to donate again."
                : `Next estimated eligibility date is ${formatDate(nextEligibleDate)}.`)}
          </p>
          {lastDonationDate && (
            <p className="text-[11px] text-slate-500">
              Last recorded donation: <span className="font-medium">{formatDate(lastDonationDate)}</span>
            </p>
          )}
        </div>
      </div>

      {showDisclaimer && (
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-start gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>
            Medical Disclaimer: Final eligibility is determined on-site via donor physical and hemoglobin screening by authorized medical staff.
          </span>
        </div>
      )}
    </div>
  );
}
