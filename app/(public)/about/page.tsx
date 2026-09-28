import React from "react";
import prisma from "@/lib/prisma";
import { Droplet, Heart, Shield, Users, CheckCircle2, Lock, Sparkles, Building2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const content = await prisma.contentPage.findUnique({
    where: { slug: "about" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200">
          <Heart className="w-3.5 h-3.5 fill-red-600" />
          <span>About BloodLife Network</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Connecting Voluntary Donors with Patients in Need
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          BloodLife is Kerala&apos;s modern, privacy-first healthcare portal dedicated to voluntary, non-commercial blood donation.
        </p>
      </div>

      {/* Core Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">100% Altruistic</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Blood donation is a humanitarian gift. We uphold strict zero-commercialization policies in accordance with national blood safety laws.
          </p>
        </Card>

        <Card className="border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Privacy by Design</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Donors deserve peace of mind. Personal contact details are protected behind secure requests so donors are never spammed.
          </p>
        </Card>

        <Card className="border-slate-200 shadow-xs p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Verified Network</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Registrations are reviewed by moderators and authenticated against duplicate submissions to maintain high directory integrity.
          </p>
        </Card>
      </div>

      {/* Detailed Mission & Story */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs space-y-6 text-slate-700 leading-relaxed text-sm">
        <h2 className="text-2xl font-bold text-slate-900">Our Story & Medical Commitment</h2>
        <p>
          Every day, hospitals across Kerala require thousands of blood units for elective surgeries, unexpected accident traumas, cancer chemotherapies, obstetric emergencies, and pediatric care for children with Thalassemia and sickle cell disease.
        </p>
        <p>
          Traditional paper directories and public social media posts often lead to donor harassment, outdated phone records, or delayed responses during the golden hour. BloodLife was built to bridge this critical gap by providing real-time, verified matching, automated eligibility tracking, and hospital request broadcasting.
        </p>

        <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-2">
          <span className="font-bold text-slate-900 block text-base">Key Operating Principles</span>
          <ul className="space-y-2 list-disc list-inside text-xs text-slate-600">
            <li><strong>Medical Screening First:</strong> Portal eligibility calculations are purely informational; mandatory clinical hemoglobin checks are conducted prior to collection.</li>
            <li><strong>Configurable Intervals:</strong> Whole blood donations enforce standard minimum 90-day intervals to protect donor health and iron reserves.</li>
            <li><strong>Audit Logging:</strong> Administrative actions and status updates are logged to ensure full transparency and data accountability.</li>
          </ul>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <a href="/become-a-donor">
          <Button variant="medical" size="lg" className="font-bold text-base px-8 shadow-lg shadow-red-500/25">
            Join the Lifesaver Network &rarr;
          </Button>
        </a>
      </div>
    </div>
  );
}
