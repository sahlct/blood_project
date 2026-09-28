"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Calendar,
  Shield,
  Heart,
  Droplet,
  Info,
  Scale,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDays, isBefore, differenceInDays } from "date-fns";
import { formatDate } from "@/lib/utils";

export default function EligibilityCalculatorPage() {
  const [lastDate, setLastDate] = useState("");
  const [age, setAge] = useState("25");
  const [weight, setWeight] = useState("60");
  const [gender, setGender] = useState("MALE");
  const [calculated, setCalculated] = useState(false);
  const [result, setResult] = useState<{
    eligible: boolean;
    nextDate: Date | null;
    reason: string;
    daysRemaining: number;
  } | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();

    const donorAge = parseInt(age, 10);
    const donorWeight = parseFloat(weight);

    // Baseline medical rules
    if (donorAge < 18 || donorAge > 65) {
      setResult({
        eligible: false,
        nextDate: null,
        reason: "Donors must be between 18 and 65 years of age.",
        daysRemaining: 0,
      });
      setCalculated(true);
      return;
    }

    if (donorWeight < 45) {
      setResult({
        eligible: false,
        nextDate: null,
        reason: "Donors must have a minimum body weight of 45 kg (50 kg recommended for whole blood).",
        daysRemaining: 0,
      });
      setCalculated(true);
      return;
    }

    // Interval calculation (standard 90 days)
    if (!lastDate) {
      setResult({
        eligible: true,
        nextDate: null,
        reason: "No prior donations recorded. You may be eligible to donate today!",
        daysRemaining: 0,
      });
      setCalculated(true);
      return;
    }

    const previousDonation = new Date(lastDate);
    const intervalDays = 90;
    const nextDate = addDays(previousDonation, intervalDays);
    const now = new Date();

    if (!isBefore(now, nextDate)) {
      setResult({
        eligible: true,
        nextDate,
        reason: "Based on your last recorded donation date, you may be eligible to donate again.",
        daysRemaining: 0,
      });
    } else {
      const remaining = differenceInDays(nextDate, now) + 1;
      setResult({
        eligible: false,
        nextDate,
        reason: `Your body requires time to replenish iron and red cells. Estimated wait: ${remaining} day${
          remaining === 1 ? "" : "s"
        }.`,
        daysRemaining: remaining,
      });
    }

    setCalculated(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
          <Droplet className="w-7 h-7 fill-red-600" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Blood Donation Eligibility & Interval Check
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Estimate when you are eligible to donate whole blood based on medical guidelines and your previous donation history.
        </p>
      </div>

      {/* Interactive Calculator Card */}
      <Card className="border-slate-200 shadow-md overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-6">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Instant Eligibility Calculator
          </CardTitle>
          <p className="text-xs text-rose-100">
            Enter your details below to calculate your estimated next donation date
          </p>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={calculate} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Last Blood Donation Date (Leave empty if first time)
                </label>
                <Input
                  type="date"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Your Age (Years)
                </label>
                <Input
                  type="number"
                  min="16"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Body Weight (in kg)
                </label>
                <Input
                  type="number"
                  min="30"
                  max="150"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="MALE">Male (Interval: 90 days)</option>
                  <option value="FEMALE">Female (Interval: 90-120 days)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="medical" size="lg" className="w-full font-bold justify-center">
              Check My Eligibility &rarr;
            </Button>
          </form>

          {/* Calculator Output */}
          {calculated && result && (
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
              <div
                className={`p-6 rounded-2xl border ${
                  result.eligible
                    ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
                    : "bg-amber-50/80 border-amber-300 text-amber-950"
                }`}
              >
                <div className="flex items-start gap-4">
                  {result.eligible ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">
                      {result.eligible
                        ? "You May Be Eligible to Donate!"
                        : "Not Yet Eligible to Donate"}
                    </h3>
                    <p className="text-sm leading-relaxed">{result.reason}</p>
                    {result.nextDate && (
                      <p className="text-xs font-semibold pt-1">
                        Estimated Next Eligible Date: {formatDate(result.nextDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-slate-500 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Medical Disclaimer:</strong> This portal calculation is for planning purposes only. Mandatory on-site medical screening, pulse check, blood pressure measurement, and hemoglobin testing (minimum 12.5 g/dL) are performed by healthcare professionals before any blood collection.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Standard Eligibility Guidelines */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Standard Donation Guidelines</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" /> You Can Donate If:
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>You are between 18 and 65 years old.</li>
              <li>You weigh at least 45 to 50 kg.</li>
              <li>Your hemoglobin is 12.5 g/dL or higher.</li>
              <li>You have had adequate sleep (at least 6 hours) the prior night.</li>
              <li>You are well-hydrated and have had a meal within 4 hours.</li>
            </ul>
          </Card>

          <Card className="border-slate-200 p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
              <AlertCircle className="w-4 h-4" /> Temporary Deferrals:
            </div>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Less than 90 days since your last whole blood donation.</li>
              <li>Active fever, flu, or infection within the past 7 days.</li>
              <li>Dental surgery, root canal, or extraction within 72 hours.</li>
              <li>Tattoo or body piercing done within the past 6 to 12 months.</li>
              <li>Major surgery undergone within the past 6 months.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
