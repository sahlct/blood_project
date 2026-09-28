"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Heart,
  Droplet,
  Shield,
  CheckCircle2,
  Calendar,
  MapPin,
  Lock,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { donorRegistrationSchema, type DonorRegistrationData } from "@/lib/validations";

export default function BecomeADonorPage() {
  const router = useRouter();
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [bloodGroups, setBloodGroups] = useState<{ id: string; group: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DonorRegistrationData>({
    resolver: zodResolver(donorRegistrationSchema),
    defaultValues: {
      publicProfileEnabled: true,
      showPhonePublicly: false,
      consentTerms: true,
      consentPrivacy: true,
    },
  });

  useEffect(() => {
    // Fetch blood groups and districts
    Promise.all([
      fetch("/api/public/blood-groups").then((r) => r.json()),
      fetch("/api/public/districts").then((r) => r.json()),
    ]).then(([bgData, distData]) => {
      if (bgData.success) setBloodGroups(bgData.data.bloodGroups);
      if (distData.success) setDistricts(distData.data.districts);
    });
  }, []);

  const onSubmit = async (data: DonorRegistrationData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/public/become-a-donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.message || "Failed to submit donor registration");
      }

      setSubmittedSuccess(true);
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 flex items-center justify-center mx-auto shadow-md shadow-red-500/25">
          <Heart className="w-7 h-7 text-white fill-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Register as a Voluntary Blood Donor
        </h1>
        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Join Kerala&apos;s lifesaving community network. Your contact details remain privacy-protected by default.
        </p>
      </div>

      {/* Trust & Workflow Banner */}
      <div className="bg-rose-50/80 rounded-2xl p-5 border border-rose-100 flex items-start gap-4">
        <Shield className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <span className="font-bold text-slate-900 block text-sm">Safe & Transparent Workflow</span>
          <p className="leading-relaxed">
            1. Submit Registration &rarr; 2. Community Moderator Verification &rarr; 3. Verified Donor Badge. Your personal phone number is NOT made public unless you explicitly opt in.
          </p>
        </div>
      </div>

      {submittedSuccess ? (
        <Card className="border-emerald-200 shadow-md p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Registration Received!</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Thank you for stepping up to save lives! Your profile has been queued for verification by our administrative team. You can sign in anytime to monitor your status and update your availability.
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <a href="/login">
              <Button variant="medical" size="lg" className="font-bold">
                Sign In to Dashboard &rarr;
              </Button>
            </a>
            <a href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </a>
          </div>
        </Card>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {serverError && (
                <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                  <User className="w-4 h-4" /> 1. Personal & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Full Legal Name <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="e.g. Rahul Sharma" {...register("fullName")} />
                    {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input type="email" placeholder="name@example.com" {...register("email")} />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Phone Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <Input type="tel" placeholder="+91 98460 00000" {...register("phone")} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Create Password <span className="text-red-500">*</span>
                    </label>
                    <Input type="password" placeholder="At least 8 characters" {...register("password")} />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 2: Medical / Blood Information */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                  <Droplet className="w-4 h-4" /> 2. Blood & Donation History
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Blood Group */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Blood Group <span className="text-red-500">*</span>
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

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Date of Birth (18-65 yrs) <span className="text-red-500">*</span>
                    </label>
                    <Input type="date" {...register("dateOfBirth")} />
                    {errors.dateOfBirth && <p className="text-xs text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Gender
                    </label>
                    <select
                      {...register("gender")}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other / Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Last Donation Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Last Blood Donation Date (Leave empty if first time)
                  </label>
                  <Input type="date" {...register("lastDonationDate")} />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Used to calculate estimated eligibility interval (standard 90 days).
                  </p>
                </div>
              </div>

              {/* Section 3: Geographic Location */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-red-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> 3. District & Locality
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      District (Kerala) <span className="text-red-500">*</span>
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

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      City / Locality Area <span className="text-red-500">*</span>
                    </label>
                    <Input placeholder="e.g. Kakkanad, Aluva, Palayam" {...register("locality")} />
                    {errors.locality && <p className="text-xs text-red-500 mt-1">{errors.locality.message}</p>}
                  </div>
                </div>
              </div>

              {/* Section 4: Privacy & Consent */}
              <div className="space-y-3 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-600" /> Privacy By Design Controls
                </h3>

                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 border-slate-300"
                    {...register("publicProfileEnabled")}
                  />
                  <span>
                    <strong>Enable Directory Visibility:</strong> Allow hospitals & patients to find my blood group in the public directory and submit secure contact requests.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 border-slate-300"
                    {...register("showPhonePublicly")}
                  />
                  <span>
                    <strong>Show Phone Number Publicly:</strong> (Optional) Check this only if you want your phone number visible directly. By default, requesters must submit a secure contact form.
                  </span>
                </label>

                <div className="pt-2 border-t border-slate-200/80 space-y-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 border-slate-300"
                      {...register("consentTerms")}
                    />
                    <span>
                      I agree to the <a href="/terms" target="_blank" className="text-red-600 underline">Terms of Service</a> and confirm that my blood donation is voluntary and altruistic. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentTerms && <p className="text-xs text-red-500">{errors.consentTerms.message}</p>}

                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-700">
                    <input
                      type="checkbox"
                      className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 border-slate-300"
                      {...register("consentPrivacy")}
                    />
                    <span>
                      I consent to the <a href="/privacy-policy" target="_blank" className="text-red-600 underline">Privacy Policy</a> and data processing for blood donor matching. <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {errors.consentPrivacy && <p className="text-xs text-red-500">{errors.consentPrivacy.message}</p>}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="medical"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full font-bold gap-2 text-base justify-center shadow-lg shadow-red-500/25"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  <span>{isSubmitting ? "Submitting Registration..." : "Complete Voluntary Donor Registration"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
