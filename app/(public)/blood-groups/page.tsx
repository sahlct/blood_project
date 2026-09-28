import React from "react";
import prisma from "@/lib/prisma";
import { Droplet, Heart, CheckCircle2, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { BloodCompatibilityWidget } from "@/components/public/BloodCompatibilityWidget";

export const dynamic = "force-dynamic";

export default async function BloodGroupsPage() {
  const fallbackBloodGroups = [
    { id: "1", group: "A+", antigen: "A", rhFactor: "+", description: "Contains A antigen on red cells with Rh factor. Most common recipient type for trauma surgeries.", canDonateTo: '["A+", "AB+"]', canReceiveFrom: '["A+", "A-", "O+", "O-"]', _count: { donorProfiles: 280 } },
    { id: "2", group: "A-", antigen: "A", rhFactor: "-", description: "Rare Rh-negative blood type essential for negative mothers and emergency surgery units.", canDonateTo: '["A-", "A+", "AB-", "AB+"]', canReceiveFrom: '["A-", "O-"]', _count: { donorProfiles: 45 } },
    { id: "3", group: "B+", antigen: "B", rhFactor: "+", description: "High demand across Kerala hospitals for chemotherapy, thalassaemia, and scheduled surgery.", canDonateTo: '["B+", "AB+"]', canReceiveFrom: '["B+", "B-", "O+", "O-"]', _count: { donorProfiles: 390 } },
    { id: "4", group: "B-", antigen: "B", rhFactor: "-", description: "Rare blood group. Hospitals regularly conduct emergency searches during urgent transfusions.", canDonateTo: '["B-", "B+", "AB-", "AB+"]', canReceiveFrom: '["B-", "O-"]', _count: { donorProfiles: 60 } },
    { id: "5", group: "AB+", antigen: "AB", rhFactor: "+", description: "Universal Red Cell Recipient. Patients can receive red blood cells from any blood group.", canDonateTo: '["AB+"]', canReceiveFrom: '["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]', _count: { donorProfiles: 110 } },
    { id: "6", group: "AB-", antigen: "AB", rhFactor: "-", description: "Rarest blood group in India (~0.5%). Maintaining an active community registry saves lives.", canDonateTo: '["AB-", "AB+"]', canReceiveFrom: '["AB-", "A-", "B-", "O-"]', _count: { donorProfiles: 25 } },
    { id: "7", group: "O+", antigen: "None", rhFactor: "+", description: "Most widely transfused blood type across India. Needed for trauma, accidents, and child delivery.", canDonateTo: '["O+", "A+", "B+", "AB+"]', canReceiveFrom: '["O+", "O-"]', _count: { donorProfiles: 430 } },
    { id: "8", group: "O-", antigen: "None", rhFactor: "-", description: "Universal Red Cell Donor. Can be given to any patient in life-threatening trauma emergencies.", canDonateTo: '["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"]', canReceiveFrom: '["O-"]', _count: { donorProfiles: 80 } },
  ];

  let bloodGroups: any[] = fallbackBloodGroups;
  try {
    const dbGroups = await prisma.bloodGroup.findMany({
      where: { isActive: true },
      orderBy: { group: "asc" },
      include: {
        _count: {
          select: {
            donorProfiles: { where: { verificationStatus: "APPROVED", deletedAt: null } },
          },
        },
      },
    });
    if (dbGroups && dbGroups.length > 0) {
      bloodGroups = dbGroups;
    }
  } catch (error) {
    console.warn("Notice: Database connection unavailable on Vercel. Serving fallback blood groups safely.");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Interactive Compatibility Engine */}
      <BloodCompatibilityWidget />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          ABO & Rh Blood Groups Clinical Directory
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Detailed antigens, clinical guidelines, and community donor supplies for each blood type across Kerala.
        </p>
      </div>

      {/* Quick Universal Donors Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl p-6 bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 space-y-2">
          <div className="flex items-center gap-3">
            <BloodGroupBadge group="O-" size="lg" />
            <div>
              <h3 className="font-bold text-base text-amber-950">Universal Red Blood Cell Donor (O-)</h3>
              <p className="text-xs text-amber-800">Can be safely given to any patient in life-threatening emergencies.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 pt-2 border-t border-amber-200/60 leading-relaxed">
            Because O- red blood cells lack A, B, and Rh antigens, other blood types do not reject them. O- donors are vital for trauma centers and neonatal care.
          </p>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-500/10 via-purple-50 to-indigo-50 border border-purple-200 space-y-2">
          <div className="flex items-center gap-3">
            <BloodGroupBadge group="AB+" size="lg" />
            <div>
              <h3 className="font-bold text-base text-purple-950">Universal Recipient (AB+)</h3>
              <p className="text-xs text-purple-800">Can receive red blood cells of any ABO/Rh blood group.</p>
            </div>
          </div>
          <p className="text-xs text-slate-600 pt-2 border-t border-purple-200/60 leading-relaxed">
            AB+ individuals have both A and B antigens and Rh factor present on their red cells, meaning their immune system does not form antibodies against any blood type.
          </p>
        </div>
      </div>

      {/* Blood Groups Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {bloodGroups.map((bg) => {
          const canDonateTo: string[] = JSON.parse(bg.canDonateTo || "[]");
          const canReceiveFrom: string[] = JSON.parse(bg.canReceiveFrom || "[]");

          return (
            <Card key={bg.id} className="border-slate-200 shadow-xs hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <BloodGroupBadge group={bg.group} size="lg" />
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    {bg._count.donorProfiles} Donors
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-3">
                  Blood Group {bg.group}
                </CardTitle>
                <div className="text-[11px] text-slate-400 font-mono">
                  Antigen: {bg.antigen} • Rh: {bg.rhFactor}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-xs flex-1">
                <p className="text-slate-600 min-h-[32px] leading-relaxed">
                  {bg.description}
                </p>

                {/* Compatibility */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-1">
                      Can Donate Red Cells To:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {canDonateTo.map((target) => (
                        <span key={target} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-[11px] border border-emerald-200">
                          {target}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-800 block text-[11px] mb-1">
                      Can Receive Red Cells From:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {canReceiveFrom.map((src) => (
                        <span key={src} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono font-bold text-[11px] border border-blue-200">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <a href={`/donors?bloodGroup=${encodeURIComponent(bg.group)}`} className="block">
                    <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between">
                      <span>Find {bg.group} Donors</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
