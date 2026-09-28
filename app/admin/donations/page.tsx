import React from "react";
import prisma from "@/lib/prisma";
import { Heart, Plus, Calendar, Hospital, CheckCircle2, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  const donations = await prisma.donationRecord.findMany({
    orderBy: { donationDate: "desc" },
    include: {
      donorProfile: {
        include: {
          user: { select: { name: true, phone: true } },
          bloodGroup: { select: { group: true } },
          district: { select: { name: true } },
        },
      },
      donationCenter: { select: { name: true } },
      donationEvent: { select: { title: true } },
      createdBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Donation Records Archive
          </h2>
          <p className="text-sm text-slate-500">
            Log of all completed whole blood and component donation records across Kerala centers.
          </p>
        </div>

        <a href="/admin/donations/new">
          <Button variant="medical" size="sm" className="gap-1.5 font-bold">
            <Plus className="w-4 h-4" />
            <span>Record New Donation</span>
          </Button>
        </a>
      </div>

      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Donor Name</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Donation Date</th>
                <th className="py-3 px-4">Facility / Center</th>
                <th className="py-3 px-4">Donation Type</th>
                <th className="py-3 px-4">Units</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No donation records found. Click &quot;Record New Donation&quot; to log the first one.
                  </td>
                </tr>
              ) : (
                donations.map((don) => (
                  <tr key={don.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{don.donorProfile.user.name}</div>
                      <div className="text-xs text-slate-500">{don.donorProfile.district.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <BloodGroupBadge group={don.donorProfile.bloodGroup.group} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {formatDate(don.donationDate)}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {don.donationCenter?.name || don.donationEvent?.title || "Community Center"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {don.donationType.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {don.unitsDonated} Unit
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {don.createdBy?.name || "System Staff"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
