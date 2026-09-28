import React from "react";
import prisma from "@/lib/prisma";
import { MapPin, Users, Hospital, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DistrictsPage() {
  const districts = await prisma.district.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      cities: { where: { isActive: true }, take: 4 },
      donationCenters: { where: { isActive: true } },
      _count: {
        select: {
          donorProfiles: { where: { verificationStatus: "APPROVED", deletedAt: null } },
          bloodRequests: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-50 via-rose-50 to-slate-50 border border-rose-200/80 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
            <MapPin className="w-3.5 h-3.5 text-red-600" />
            <span>Statewide Kerala Coverage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Kerala Districts Donor Directory
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Locate voluntary blood donors, accredited donation centers, and hospital emergency requirements across all 14 districts of Kerala.
          </p>
        </div>

        <a href="/become-a-donor">
          <Button variant="medical" size="lg" className="font-bold gap-2 shadow-md shadow-red-600/25">
            <span>Register in Your District</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {districts.map((d) => (
          <Card key={d.id} className="rounded-3xl border border-slate-200/90 shadow-xs hover:border-red-300 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between bg-white overflow-hidden group">
            <CardHeader className="pb-3 pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                  {d.code || "KL"}
                </span>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  {d._count.donorProfiles} Active Donors
                </span>
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 mt-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span>{d.name}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 text-xs flex-1">
              {/* Cities / Localities preview */}
              <div>
                <span className="font-bold text-slate-700 block mb-1">Major Localities:</span>
                <div className="flex flex-wrap gap-1">
                  {d.cities.map((city) => (
                    <span key={city.id} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {city.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Donation Centers in District */}
              {d.donationCenters.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-700 block mb-1">Key Donation Center:</span>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Hospital className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{d.donationCenters[0].name}</span>
                  </div>
                </div>
              )}

              {/* Emergency appeals in district */}
              {d._count.bloodRequests > 0 && (
                <div className="text-red-700 font-bold bg-red-50 p-2 rounded-lg border border-red-200">
                  {d._count.bloodRequests} Active Urgent Appeal(s)
                </div>
              )}

              <div className="pt-2">
                <a href={`/donors?district=${encodeURIComponent(d.name)}`} className="block">
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold justify-between">
                    <span>Search Donors in {d.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
