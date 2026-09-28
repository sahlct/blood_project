import React from "react";
import prisma from "@/lib/prisma";
import { Shield, Lock, Eye, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PrivacyPolicyPage() {
  const page = await prisma.contentPage.findUnique({
    where: { slug: "privacy-policy" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Privacy by Design</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {page?.title || "Privacy Policy"}
        </h1>
        <p className="text-sm text-slate-500">Last updated: September 2026</p>
      </div>

      <Card className="border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Healthcare Data Minimization</h2>
          <p>
            BloodLife collects only the minimal required information necessary to facilitate voluntary blood donation matching: your name, contact phone, email, blood group, and district. We do not store detailed personal medical records or chronic condition histories.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Directory Privacy & Secure Contact</h2>
          <p>
            Unlike open phone registries, your phone number is <strong>not publicly visible by default</strong>. When a patient or hospital requires your blood group, they submit a secure contact request through the portal. You receive an instant alert and can choose when to respond.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Donor Consent & Availability Control</h2>
          <p>
            You have full autonomy over your data. At any time from your member dashboard, you can pause your availability, remove your profile from the public directory, or request complete account deletion.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Non-Commercial Commitment</h2>
          <p>
            Your information will never be sold, rented, or shared with commercial marketers, pharmaceutical companies, or third-party advertisers. All data is processed strictly for humanitarian blood donation matching.
          </p>
        </section>
      </Card>
    </div>
  );
}
