import React from "react";
import prisma from "@/lib/prisma";
import {
  AlertCircle,
  Hospital,
  MapPin,
  Clock,
  Phone,
  Plus,
  Share2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BloodRequestsPage() {
  const requests = await prisma.bloodRequest.findMany({
    where: { status: "ACTIVE", publicVisible: true },
    orderBy: [
      { urgency: "desc" }, // CRITICAL first
      { requiredDate: "asc" },
    ],
    include: {
      bloodGroup: true,
      district: true,
      city: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Urgent Blood Requirements
            </h1>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Real-time critical requests submitted for hospitalized patients across Kerala.
          </p>
        </div>

        <a href="/blood-requests/new">
          <Button variant="medical" size="lg" className="gap-2 font-bold shadow-md shadow-red-500/20">
            <Plus className="w-5 h-5" />
            <span>Post Blood Requirement</span>
          </Button>
        </a>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50/80 border border-red-200 rounded-2xl p-4 sm:p-5 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
        <div className="text-xs text-red-900 space-y-1">
          <span className="font-bold text-sm block">How to Respond to a Blood Request</span>
          <p className="leading-relaxed">
            If you or someone in your network has the required blood group and is eligible, call the verified hospital contact person directly. Transfusions must be conducted through certified blood banks.
          </p>
        </div>
      </div>

      {/* Requests Grid */}
      {requests.length === 0 ? (
        <Card className="border-slate-200 p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">No Active Urgent Blood Requests</h2>
          <p className="text-sm text-slate-500">
            All active requirements have been fulfilled. Need blood for a patient? Post a request above.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              {req.urgency === "CRITICAL" && (
                <div className="h-1.5 w-full bg-red-600 animate-pulse" />
              )}
              {req.urgency === "HIGH" && (
                <div className="h-1.5 w-full bg-amber-500" />
              )}

              <CardHeader className="pb-3 pt-5">
                <div className="flex items-center justify-between">
                  <BloodGroupBadge group={req.bloodGroup.group} size="lg" />
                  <StatusBadge status={req.urgency} type="urgency" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 mt-3">
                  {req.patientName}
                </CardTitle>
                <div className="text-xs font-mono text-slate-400">
                  Ref: {req.referenceNumber}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 text-xs text-slate-600 flex-1">
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-start gap-2">
                    <Hospital className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">{req.hospitalName}</span>
                      {req.hospitalAddress && (
                        <span className="text-slate-500 text-[11px] block">{req.hospitalAddress}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{req.district.name}, Kerala</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Date Required: <strong className="text-slate-900">{formatDate(req.requiredDate)}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Units Required:</span>
                  <span className="text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 font-bold">
                    {req.unitsRequired} Unit(s)
                  </span>
                </div>

                {req.notes && (
                  <p className="italic text-slate-500 bg-rose-50/40 p-2.5 rounded-lg border border-rose-100">
                    &quot;{req.notes}&quot;
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs text-slate-500 mb-1">Emergency Contact Person:</div>
                  <div className="font-bold text-slate-900 text-sm">{req.contactPerson}</div>
                  <a
                    href={`tel:${req.contactPhone}`}
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call: {req.contactPhone}</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
