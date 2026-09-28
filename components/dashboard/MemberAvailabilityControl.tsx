"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, XCircle, Shield, Phone, Eye, EyeOff, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MemberAvailabilityControlProps {
  donorId: string;
  initialStatus: string;
  initialPublicListing: boolean;
  initialShowPhone: boolean;
}

export function MemberAvailabilityControl({
  donorId,
  initialStatus,
  initialPublicListing,
  initialShowPhone,
}: MemberAvailabilityControlProps) {
  const [status, setStatus] = useState(initialStatus);
  const [publicListing, setPublicListing] = useState(initialPublicListing);
  const [showPhone, setShowPhone] = useState(initialShowPhone);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/member/availability", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          availabilityStatus: status,
          publicProfileEnabled: publicListing,
          showPhonePublicly: showPhone,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to update availability");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Error saving availability");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-slate-200 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            Your Availability & Privacy Controls
          </span>
          {saved && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </CardTitle>
        <p className="text-xs text-slate-500">
          Control your readiness to donate and your directory privacy settings
        </p>
      </CardHeader>

      <CardContent className="space-y-5">
        {error && (
          <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Availability Status Options */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Current Donation Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setStatus("AVAILABLE")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                status === "AVAILABLE"
                  ? "bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-sm">Available</span>
              </div>
              <p className="text-[11px] text-slate-500">Ready to donate upon emergency request</p>
            </button>

            <button
              type="button"
              onClick={() => setStatus("TEMPORARILY_UNAVAILABLE")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                status === "TEMPORARILY_UNAVAILABLE"
                  ? "bg-amber-50/80 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-500/20"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-sm">Temporarily Busy</span>
              </div>
              <p className="text-[11px] text-slate-500">Traveling, minor illness, or short pause</p>
            </button>

            <button
              type="button"
              onClick={() => setStatus("NOT_AVAILABLE")}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                status === "NOT_AVAILABLE"
                  ? "bg-slate-100 border-slate-500 text-slate-900 font-bold ring-2 ring-slate-500/20"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="font-semibold text-sm">Inactive</span>
              </div>
              <p className="text-[11px] text-slate-500">Not accepting donation inquiries</p>
            </button>
          </div>
        </div>

        {/* Privacy Toggles */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Privacy & Listing Preferences
          </label>

          {/* Directory Visibility Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-600" />
                Public Directory Listing
              </span>
              <p className="text-xs text-slate-500">
                Allow patients & hospitals to locate your blood group in search results
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={publicListing}
                onChange={(e) => setPublicListing(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {/* Show Phone Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-slate-600" />
                Show Phone Number Publicly
              </span>
              <p className="text-xs text-slate-500">
                Off by default. When off, requesters contact you through secure portal requests.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="gap-1.5 font-bold"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Updating..." : "Save Preferences"}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
