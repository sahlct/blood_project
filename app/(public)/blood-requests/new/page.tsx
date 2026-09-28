"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Hospital, MapPin, Phone, User, Calendar, CheckCircle2, Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { bloodRequestSchema, type BloodRequestData } from "@/lib/validations";

export default function NewBloodRequestPage() {
  const router = useRouter();
  const [bloodGroups, setBloodGroups] = useState<{ id: string; group: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BloodRequestData>({
    resolver: zodResolver(bloodRequestSchema),
    defaultValues: {
      urgency: "HIGH",
      unitsRequired: 1,
      requiredDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/public/blood-groups").then((r) => r.json()),
      fetch("/api/public/districts").then((r) => r.json()),
    ]).then(([bgData, distData]) => {
      if (bgData.success) setBloodGroups(bgData.data.bloodGroups);
      if (distData.success) setDistricts(distData.data.districts);
    });
  }, []);

  const onSubmit = async (data: BloodRequestData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/public/blood-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to submit request");
      }

      setCreatedRef(result.data.referenceNumber);
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Post an Emergency Blood Requirement
        </h1>
        <p className="text-sm text-slate-600">
          Broadcast your patient&apos;s need across registered voluntary donors in your district.
        </p>
      </div>

      {createdRef ? (
        <Card className="border-emerald-200 shadow-sm p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Request Broadcasted!</h2>
          <p className="text-sm text-slate-600">
            Reference Number: <strong className="font-mono text-red-600">{createdRef}</strong>
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your emergency requirement is now live in the portal. Eligible donors in your district will be alerted to contact you directly.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <a href="/blood-requests">
              <Button variant="medical">View Live Requests</Button>
            </a>
            <a href="/donors">
              <Button variant="outline">Search Donors Directly</Button>
            </a>
          </div>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverError && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200">
                  {serverError}
                </div>
              )}

              {/* Patient & Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Full name of patient" {...register("patientName")} />
                  {errors.patientName && <p className="text-xs text-red-500 mt-1">{errors.patientName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Required Blood Group <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("bloodGroupId")}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- Select Blood Group --</option>
                    {bloodGroups.map((bg) => (
                      <option key={bg.id} value={bg.id}>
                        {bg.group} Group
                      </option>
                    ))}
                  </select>
                  {errors.bloodGroupId && <p className="text-xs text-red-500 mt-1">{errors.bloodGroupId.message}</p>}
                </div>
              </div>

              {/* Units & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Units Required <span className="text-red-500">*</span>
                  </label>
                  <Input type="number" min="1" max="20" {...register("unitsRequired", { valueAsNumber: true })} />
                  {errors.unitsRequired && <p className="text-xs text-red-500 mt-1">{errors.unitsRequired.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Urgency Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("urgency")}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="CRITICAL">Critical (Immediate / Next few hours)</option>
                    <option value="HIGH">High (Within 24 hours)</option>
                    <option value="MEDIUM">Medium (Within 2-3 days)</option>
                    <option value="LOW">Low (Scheduled elective surgery)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Date Needed <span className="text-red-500">*</span>
                  </label>
                  <Input type="date" {...register("requiredDate")} />
                  {errors.requiredDate && <p className="text-xs text-red-500 mt-1">{errors.requiredDate.message}</p>}
                </div>
              </div>

              {/* Hospital & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="e.g. Medical College Hospital, Ernakulam General" {...register("hospitalName")} />
                  {errors.hospitalName && <p className="text-xs text-red-500 mt-1">{errors.hospitalName.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("districtId")}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">-- Choose District --</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {errors.districtId && <p className="text-xs text-red-500 mt-1">{errors.districtId.message}</p>}
                </div>
              </div>

              {/* Hospital Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Hospital Address / Room / Ward (Optional)
                </label>
                <Input placeholder="e.g. ICU Ward 3, Blood Bank Counter 2" {...register("hospitalAddress")} />
              </div>

              {/* Contact Person Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Attendant / Contact Person <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="Relative or coordinator name" {...register("contactPerson")} />
                  {errors.contactPerson && <p className="text-xs text-red-500 mt-1">{errors.contactPerson.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input type="tel" placeholder="+91 98460 00000" {...register("contactPhone")} />
                  {errors.contactPhone && <p className="text-xs text-red-500 mt-1">{errors.contactPhone.message}</p>}
                </div>
              </div>

              {/* Case Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Emergency Medical Case Notes (Optional)
                </label>
                <Textarea
                  placeholder="e.g. Emergency bypass surgery, acute anemia, cancer chemotherapy..."
                  {...register("notes")}
                  rows={2}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="medical"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full font-bold gap-2 text-base justify-center shadow-lg shadow-red-500/25"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span>{isSubmitting ? "Publishing Emergency Appeal..." : "Broadcast Blood Requirement"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
