"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Calendar, Hospital, User, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface DonorOption {
  id: string;
  name: string;
  bloodGroup: string;
  district: string;
}

interface CenterOption {
  id: string;
  name: string;
  district: string;
}

function NewDonationRecordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDonorId = searchParams.get("donorId") || "";

  const [donors, setDonors] = useState<DonorOption[]>([]);
  const [centers, setCenters] = useState<CenterOption[]>([]);
  const [selectedDonorId, setSelectedDonorId] = useState(preselectedDonorId);
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split("T")[0]);
  const [donationCenterId, setDonationCenterId] = useState("");
  const [donationType, setDonationType] = useState("WHOLE_BLOOD");
  const [unitsDonated, setUnitsDonated] = useState("1.0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch verified donors list
    fetch("/api/admin/donors?status=APPROVED&limit=100")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDonors(
            data.data.donors.map((d: any) => ({
              id: d.id,
              name: d.name,
              bloodGroup: d.bloodGroup,
              district: d.district,
            }))
          );
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorId) {
      setError("Please select a donor");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorProfileId: selectedDonorId,
          donationDate,
          donationCenterId: donationCenterId || null,
          donationType,
          unitsDonated: parseFloat(unitsDonated) || 1.0,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to record donation");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/donations");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Log Completed Blood Donation
        </h2>
        <p className="text-sm text-slate-500">
          Recording a donation automatically recalculates the donor&apos;s next eligible donation date and updates their official profile.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Donation Successfully Logged!</h3>
              <p className="text-sm text-slate-500">
                The donor profile has been updated and next eligibility date has been recalculated.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              {/* Select Donor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Donor <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDonorId}
                  onChange={(e) => setSelectedDonorId(e.target.value)}
                  required
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Choose a verified donor --</option>
                  {donors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.bloodGroup}) — {d.district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Donation Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Donation Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={donationDate}
                  onChange={(e) => setDonationDate(e.target.value)}
                  required
                />
              </div>

              {/* Donation Type & Units */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Donation Type
                  </label>
                  <select
                    value={donationType}
                    onChange={(e) => setDonationType(e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="PLATELETS">Platelets (Apheresis)</option>
                    <option value="PLASMA">Plasma</option>
                    <option value="DOUBLE_RED_CELLS">Double Red Cells</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Units Donated
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="3.0"
                    value={unitsDonated}
                    onChange={(e) => setUnitsDonated(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Clinical Notes / Hemoglobin */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Clinical Notes / Hemoglobin Level (Optional)
                </label>
                <Textarea
                  placeholder="e.g. Hemoglobin 13.5 g/dL, BP 120/80 mmHg, donated at Hospital Blood Bank"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="medical" disabled={loading} className="gap-1.5 font-bold">
                  <Heart className="w-4 h-4 fill-white" />
                  <span>{loading ? "Recording..." : "Record & Update Donor"}</span>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewDonationRecordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading donation form...</div>}>
      <NewDonationRecordContent />
    </Suspense>
  );
}
