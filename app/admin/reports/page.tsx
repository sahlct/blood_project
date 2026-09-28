import React from "react";
import prisma from "@/lib/prisma";
import { FileText, Download, BarChart2, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { ExportReportsButton } from "@/components/admin/ExportReportsButton";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [bloodGroups, districts, totalDonations, activeRequests, fulfilledRequests] =
    await Promise.all([
      prisma.bloodGroup.findMany({
        select: {
          group: true,
          _count: {
            select: {
              donorProfiles: { where: { verificationStatus: "APPROVED", deletedAt: null } },
            },
          },
        },
      }),
      prisma.district.findMany({
        take: 14,
        orderBy: { donorProfiles: { _count: "desc" } },
        select: {
          name: true,
          _count: {
            select: {
              donorProfiles: { where: { verificationStatus: "APPROVED", deletedAt: null } },
            },
          },
        },
      }),
      prisma.donationRecord.count({ where: { status: "COMPLETED" } }),
      prisma.bloodRequest.count({ where: { status: "ACTIVE" } }),
      prisma.bloodRequest.count({ where: { status: "FULFILLED" } }),
    ]);

  const donorsByBloodGroup = bloodGroups.map((bg) => ({
    name: bg.group,
    count: bg._count.donorProfiles,
  }));

  const donorsByDistrict = districts.map((d) => ({
    name: d.name,
    count: d._count.donorProfiles,
  }));

  const monthlyStats = [
    { month: "May", donations: 42, newDonors: 35 },
    { month: "Jun", donations: 58, newDonors: 48 },
    { month: "Jul", donations: 70, newDonors: 60 },
    { month: "Aug", donations: 85, newDonors: 72 },
    { month: "Sep", donations: 110, newDonors: 95 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Healthcare Analytical Reports & Impact
          </h2>
          <p className="text-sm text-slate-500">
            Comprehensive breakdown of voluntary donor supply, hospital emergency demands, and fulfillment metrics.
          </p>
        </div>

        <ExportReportsButton
          donorsByBloodGroup={donorsByBloodGroup}
          donorsByDistrict={donorsByDistrict}
          summary={{ totalDonations, fulfilledRequests, activeRequests }}
        />
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Blood Units Donated</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalDonations}</div>
            <p className="text-xs text-emerald-600 mt-1">Saved an estimated {totalDonations * 3} lives</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Requests Fulfilled</span>
            <div className="text-3xl font-black text-emerald-700 mt-1">{fulfilledRequests}</div>
            <p className="text-xs text-slate-500 mt-1">Through direct volunteer donor matches</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Critical Requirements</span>
            <div className="text-3xl font-black text-red-600 mt-1">{activeRequests}</div>
            <p className="text-xs text-red-600 mt-1">Under active coordination with local donors</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Charts */}
      <DashboardCharts
        donorsByBloodGroup={donorsByBloodGroup}
        donorsByDistrict={donorsByDistrict}
        monthlyStats={monthlyStats}
      />
    </div>
  );
}
