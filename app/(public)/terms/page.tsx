import React from "react";
import prisma from "@/lib/prisma";
import { FileText, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const page = await prisma.contentPage.findUnique({
    where: { slug: "terms" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {page?.title || "Terms and Conditions"}
        </h1>
        <p className="text-sm text-slate-500">Effective Date: September 2026</p>
      </div>

      <Card className="border-slate-200 shadow-sm p-6 sm:p-10 space-y-6 text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Voluntary Altruistic Blood Donation</h2>
          <p>
            Participation in the BloodLife portal as a voluntary donor is entirely altruistic. The commercial sale or purchase of human blood is illegal under Indian law and strictly prohibited. Any attempts at commercial exploitation will result in immediate permanent expulsion and reporting to law enforcement authorities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Medical Screening & Clearance</h2>
          <p>
            The eligibility statuses and next eligible donation dates calculated by BloodLife are algorithmic estimates based on dates provided by users. Final clearance for blood donation is strictly subject to on-site hemoglobin testing, vital signs check, and physical examination by medical personnel at authorized blood centers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Accurate Information</h2>
          <p>
            Users agree to provide truthful contact, location, and previous donation date records. Submitting false medical or emergency hospital requirements is a serious violation of community guidelines.
          </p>
        </section>
      </Card>
    </div>
  );
}
