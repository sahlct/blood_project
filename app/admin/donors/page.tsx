"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

interface DonorItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  district: string;
  city: string | null;
  locality: string | null;
  availabilityStatus: string;
  verificationStatus: string;
  isEligible: boolean;
  lastDonationDate: string | null;
  nextEligibleDonationDate: string | null;
  totalDonations: number;
  publicProfileEnabled: boolean;
  createdAt: string;
}

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        status: statusFilter,
        bloodGroup: bloodGroupFilter,
        search: searchQuery,
      });

      const res = await fetch(`/api/admin/donors?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDonors(data.data.donors);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [page, statusFilter, bloodGroupFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonors();
  };

  const handleApprove = async (donorId: string) => {
    setProcessingId(donorId);
    try {
      const res = await fetch(`/api/admin/donors/${donorId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Verified by administrator review" }),
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setDonors((prev) =>
          prev.map((d) => (d.id === donorId ? { ...d, verificationStatus: "APPROVED" } : d))
        );
      }
    } catch (err) {
      console.error("Failed to approve donor:", err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (donorId: string) => {
    const reason = prompt("Enter rejection reason (optional):", "Did not meet verification criteria");
    if (reason === null) return; // User cancelled

    setProcessingId(donorId);
    try {
      const res = await fetch(`/api/admin/donors/${donorId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setDonors((prev) =>
          prev.map((d) => (d.id === donorId ? { ...d, verificationStatus: "REJECTED" } : d))
        );
      }
    } catch (err) {
      console.error("Failed to reject donor:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Donor Registry & Moderation
          </h2>
          <p className="text-sm text-slate-500">
            Verify newly registered donors, inspect availability, and manage community profiles.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchDonors()}
          disabled={loading}
          className="gap-1.5 border-slate-300"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <Input
                placeholder="Search by name, email, phone, locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">All Verification Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved & Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Blood Group Filter */}
            <div>
              <select
                value={bloodGroupFilter}
                onChange={(e) => {
                  setBloodGroupFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="ALL">All Blood Groups</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg} Group
                  </option>
                ))}
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Donors Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Donor Details</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4">Eligibility Status</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
                    Loading donor records...
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No donors matching the specified criteria.
                  </td>
                </tr>
              ) : (
                donors.map((donor) => (
                  <tr key={donor.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Donor Details */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{donor.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{donor.email}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{donor.phone}</span>
                      </div>
                    </td>

                    {/* Blood Group */}
                    <td className="py-3 px-4">
                      <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{donor.district}</div>
                      <div className="text-xs text-slate-500">{donor.locality || donor.city || "Kerala"}</div>
                    </td>

                    {/* Availability */}
                    <td className="py-3 px-4">
                      <StatusBadge status={donor.availabilityStatus} type="availability" />
                    </td>

                    {/* Eligibility */}
                    <td className="py-3 px-4">
                      {donor.isEligible ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          {donor.nextEligibleDonationDate
                            ? `Wait until ${formatDate(donor.nextEligibleDonationDate)}`
                            : "Not Eligible"}
                        </span>
                      )}
                    </td>

                    {/* Verification Status */}
                    <td className="py-3 px-4">
                      <StatusBadge status={donor.verificationStatus} type="verification" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1">
                      {donor.verificationStatus === "PENDING" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                            disabled={processingId === donor.id}
                            onClick={() => handleApprove(donor.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-2.5 text-xs"
                            disabled={processingId === donor.id}
                            onClick={() => handleReject(donor.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}

                      {donor.verificationStatus === "APPROVED" && (
                        <a href={`/admin/donations/new?donorId=${donor.id}&name=${encodeURIComponent(donor.name)}`}>
                          <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                            Log Donation
                          </Button>
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
