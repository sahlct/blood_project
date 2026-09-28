import React from "react";
import prisma from "@/lib/prisma";
import {
  Users,
  Heart,
  Droplet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { formatDate } from "@/lib/utils";
import { AvailabilityStatus, VerificationStatus, BloodRequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // Parallel database metrics
  const [
    totalDonors,
    activeDonors,
    availableDonors,
    eligibleDonors,
    temporarilyUnavailableDonors,
    pendingApprovals,
    totalCompletedDonations,
    activeBloodRequests,
    pendingDonorsList,
    recentDonations,
    bloodGroups,
    districts,
  ] = await Promise.all([
    prisma.donorProfile.count({ where: { deletedAt: null } }),
    prisma.donorProfile.count({
      where: { verificationStatus: VerificationStatus.APPROVED, deletedAt: null },
    }),
    prisma.donorProfile.count({
      where: {
        verificationStatus: VerificationStatus.APPROVED,
        availabilityStatus: AvailabilityStatus.AVAILABLE,
        deletedAt: null,
      },
    }),
    prisma.donorProfile.count({
      where: {
        verificationStatus: VerificationStatus.APPROVED,
        isEligible: true,
        deletedAt: null,
      },
    }),
    prisma.donorProfile.count({
      where: {
        availabilityStatus: AvailabilityStatus.TEMPORARILY_UNAVAILABLE,
        deletedAt: null,
      },
    }),
    prisma.donorProfile.count({
      where: { verificationStatus: VerificationStatus.PENDING, deletedAt: null },
    }),
    prisma.donationRecord.count({ where: { status: "COMPLETED" } }),
    prisma.bloodRequest.count({ where: { status: BloodRequestStatus.ACTIVE } }),
    // Pending approvals preview
    prisma.donorProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING, deletedAt: null },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        bloodGroup: { select: { group: true } },
        district: { select: { name: true } },
      },
    }),
    // Recent donations preview
    prisma.donationRecord.findMany({
      take: 5,
      where: { status: "COMPLETED" },
      orderBy: { donationDate: "desc" },
      include: {
        donorProfile: {
          include: {
            user: { select: { name: true } },
            bloodGroup: { select: { group: true } },
            district: { select: { name: true } },
          },
        },
      },
    }),
    // Blood group chart data
    prisma.bloodGroup.findMany({
      select: {
        group: true,
        _count: {
          select: {
            donorProfiles: {
              where: { verificationStatus: VerificationStatus.APPROVED, deletedAt: null },
            },
          },
        },
      },
    }),
    // District chart data
    prisma.district.findMany({
      take: 14,
      orderBy: { donorProfiles: { _count: "desc" } },
      select: {
        name: true,
        _count: {
          select: {
            donorProfiles: {
              where: { verificationStatus: VerificationStatus.APPROVED, deletedAt: null },
            },
          },
        },
      },
    }),
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
    <div className="space-y-8">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Executive Operations Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Real-time oversight of voluntary donors, verification queue, and blood emergency requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a href="/admin/donors?status=PENDING">
            <Button variant="outline" size="sm" className="gap-1.5 border-slate-300">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Review Pending ({pendingApprovals})</span>
            </Button>
          </a>
          <a href="/admin/donations/new">
            <Button variant="medical" size="sm" className="gap-1.5 font-bold">
              <Heart className="w-4 h-4 fill-white" />
              <span>Record Donation</span>
            </Button>
          </a>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Donors */}
        <Card className="border-slate-200 shadow-xs hover:border-red-200 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Donors</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalDonors}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeDonors} verified</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Available Donors */}
        <Card className="border-slate-200 shadow-xs hover:border-emerald-200 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Now</p>
              <h3 className="text-3xl font-black text-emerald-700 mt-1">{availableDonors}</h3>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1">
                <span>{temporarilyUnavailableDonors} temporarily paused</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Droplet className="w-6 h-6 fill-emerald-600" />
            </div>
          </CardContent>
        </Card>

        {/* Eligible Donors */}
        <Card className="border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Eligible to Donate</p>
              <h3 className="text-3xl font-black text-blue-700 mt-1">{eligibleDonors}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Interval completed</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card className="border-slate-200 shadow-xs hover:border-amber-200 transition-colors">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingApprovals}</h3>
              <p className="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Requires verification</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics: Donations & Active Emergencies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Total Units Donated</span>
            <div className="text-4xl font-black mt-1">{totalCompletedDonations} units</div>
            <p className="text-xs text-rose-100 mt-2">Saved an estimated {totalCompletedDonations * 3} lives across regional blood banks.</p>
          </div>
          <Heart className="w-16 h-16 text-rose-300/40 fill-white" />
        </div>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Urgent Requests</span>
            <div className="text-4xl font-black mt-1 text-red-400">{activeBloodRequests} active</div>
            <p className="text-xs text-slate-300 mt-2">Critical emergency requests broadcasted across local donor pools.</p>
          </div>
          <AlertCircle className="w-16 h-16 text-red-500/30" />
        </div>
      </div>

      {/* Analytics Charts */}
      <DashboardCharts
        donorsByBloodGroup={donorsByBloodGroup}
        donorsByDistrict={donorsByDistrict}
        monthlyStats={monthlyStats}
      />

      {/* Actionable Queue: Pending Approvals & Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Donor Verification Queue */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                Pending Verification Queue
              </CardTitle>
              <p className="text-xs text-slate-500">New donor signups awaiting administrator review</p>
            </div>
            <a href="/admin/donors?status=PENDING" className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1">
              View all ({pendingApprovals}) <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </CardHeader>
          <CardContent>
            {pendingDonorsList.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                All donor registrations are up to date! No pending approvals.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pendingDonorsList.map((donor) => (
                  <div key={donor.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge group={donor.bloodGroup.group} size="sm" />
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{donor.user.name}</div>
                        <div className="text-xs text-slate-500">{donor.district.name} • Registered {formatDate(donor.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`/admin/donors?status=PENDING`}>
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2.5">
                          Review
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Completed Donations */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                Recent Completed Donations
              </CardTitle>
              <p className="text-xs text-slate-500">Official hospital & camp donation records</p>
            </div>
            <a href="/admin/donations" className="text-xs font-semibold text-red-600 hover:underline flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </CardHeader>
          <CardContent>
            {recentDonations.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-500">
                No donation records logged yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentDonations.map((don) => (
                  <div key={don.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge group={don.donorProfile.bloodGroup.group} size="sm" />
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{don.donorProfile.user.name}</div>
                        <div className="text-xs text-slate-500">
                          {don.donorProfile.district.name} • {formatDate(don.donationDate)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {don.unitsDonated} Unit
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
