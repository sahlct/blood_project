import React from "react";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { calculateDonorEligibility } from "@/lib/services/eligibility";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EligibilityIndicator } from "@/components/common/EligibilityIndicator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import {
  Droplet,
  Heart,
  Calendar,
  Clock,
  Shield,
  Eye,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Bell,
  ArrowRight,
} from "lucide-react";
import { MemberAvailabilityControl } from "@/components/dashboard/MemberAvailabilityControl";

export const dynamic = "force-dynamic";

export default async function MemberDashboardPage() {
  const session = await getSessionUser();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      memberProfile: true,
      donorProfile: {
        include: {
          bloodGroup: true,
          district: true,
          city: true,
          donationRecords: {
            orderBy: { donationDate: "desc" },
            take: 5,
            include: {
              donationCenter: { select: { name: true } },
            },
          },
          contactRequests: {
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
              bloodGroup: true,
            },
          },
        },
      },
      notifications: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) return null;

  const donor = user.donorProfile;

  // Calculate dynamic eligibility
  const eligibility = donor
    ? await calculateDonorEligibility({
        lastDonationDate: donor.lastDonationDate,
        availabilityStatus: donor.availabilityStatus,
        verificationStatus: donor.verificationStatus,
      })
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome, {user.name}
            </h1>
            {donor && <StatusBadge status={donor.verificationStatus} type="verification" />}
          </div>
          <p className="text-sm text-slate-500">
            Member ID: <span className="font-mono">{user.id.slice(-8)}</span> • Joined {formatDate(user.createdAt)}
          </p>
        </div>

        {donor ? (
          <div className="flex items-center gap-4 bg-red-50/60 p-4 rounded-2xl border border-red-100">
            <BloodGroupBadge group={donor.bloodGroup.group} size="lg" />
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-red-900 block">Registered Voluntary Donor</span>
              <span className="text-slate-600 block">{donor.district.name}, Kerala</span>
              <span className="text-red-700 font-semibold block">{donor.totalDonations} Lifetime Donations</span>
            </div>
          </div>
        ) : (
          <a href="/become-a-donor">
            <Button variant="medical" className="gap-2 font-bold">
              <Heart className="w-4 h-4 fill-white" />
              <span>Register as Blood Donor</span>
            </Button>
          </a>
        )}
      </div>

      {/* Main Donor Panel */}
      {donor ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Eligibility & Availability Control */}
          <div className="lg:col-span-2 space-y-6">
            {/* Eligibility Indicator Box */}
            {eligibility && (
              <EligibilityIndicator
                isEligible={eligibility.eligible}
                nextEligibleDate={eligibility.nextEligibleDate}
                lastDonationDate={donor.lastDonationDate}
                reason={eligibility.reason}
              />
            )}

            {/* Interactive Availability & Privacy Control */}
            <MemberAvailabilityControl
              donorId={donor.id}
              initialStatus={donor.availabilityStatus}
              initialPublicListing={donor.publicProfileEnabled}
              initialShowPhone={donor.showPhonePublicly}
            />

            {/* Donation History */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-600" />
                  Your Blood Donation History
                </CardTitle>
                <span className="text-xs text-slate-500">{donor.totalDonations} completed donations</span>
              </CardHeader>
              <CardContent>
                {donor.donationRecords.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    No donation records currently logged under this profile. When you donate at a recognized camp or hospital, staff will record your donation.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {donor.donationRecords.map((record) => (
                      <div key={record.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm text-slate-900">
                            {formatDate(record.donationDate)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {record.donationCenter?.name || "Official Donation Center"} • {record.donationType.replace("_", " ")}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {record.unitsDonated} Unit
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inbound Contact Requests */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-rose-600" />
                  Inbound Blood Donation Inquiries
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Requests sent by verified hospital patients requiring your blood group
                </p>
              </CardHeader>
              <CardContent>
                {donor.contactRequests.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-500">
                    No direct contact inquiries received yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {donor.contactRequests.map((req) => (
                      <div key={req.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Patient: {req.patientName}</span>
                          <span className="text-[11px] text-slate-500">{formatDate(req.createdAt)}</span>
                        </div>
                        <div className="text-slate-600">
                          Facility: <strong>{req.hospitalName}</strong> • Needed: <strong>{req.unitsRequired} unit(s) on {formatDate(req.requiredDate)}</strong>
                        </div>
                        <div className="pt-1 text-slate-700">
                          Requester Contact: <strong>{req.requesterName}</strong> ({req.requesterPhone})
                        </div>
                        {req.message && (
                          <div className="italic text-slate-500 pt-1 border-t border-slate-200">
                            &quot;{req.message}&quot;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Notifications & Community Resources */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-700" />
                  System Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.notifications.length === 0 ? (
                  <div className="text-center py-6 text-sm text-slate-400">
                    No new notifications.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {user.notifications.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs space-y-1">
                        <div className="font-bold text-slate-900">{n.title}</div>
                        <p className="text-slate-600 leading-relaxed">{n.message}</p>
                        <div className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-slate-200 shadow-xs bg-gradient-to-br from-red-600 to-rose-700 text-white">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Save Lives in Your District</h3>
                <p className="text-xs text-rose-100 leading-relaxed">
                  Join upcoming voluntary donation camps or review urgent emergency appeals in {donor.district.name}.
                </p>
                <div className="space-y-2 pt-2">
                  <a href="/blood-requests" className="block w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-between font-bold text-slate-900">
                      <span>View Urgent Requests</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href="/events" className="block w-full">
                    <Button variant="outline" size="sm" className="w-full justify-between border-rose-300 text-white hover:bg-rose-800">
                      <span>Upcoming Camps</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Member is not yet registered as a donor */
        <Card className="border-slate-200 shadow-sm p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Become a Voluntary Blood Donor</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            You are currently registered as a standard community member. Register your blood group and location to receive voluntary donation alerts and help patients in need.
          </p>
          <div className="pt-2">
            <a href="/become-a-donor">
              <Button variant="medical" size="lg" className="font-bold">
                Complete Donor Registration &rarr;
              </Button>
            </a>
          </div>
        </Card>
      )}
    </div>
  );
}
