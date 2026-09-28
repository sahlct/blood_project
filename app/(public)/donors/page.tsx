"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Droplet,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  Mail,
  Heart,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

interface DonorCardData {
  id: string;
  name: string;
  avatar: string | null;
  bloodGroup: string;
  rhFactor: string;
  district: string;
  city: string | null;
  locality: string | null;
  availabilityStatus: string;
  verificationStatus: string;
  isEligible: boolean;
  nextEligibleDonationDate: string | null;
  lastDonationDate: string | null;
  totalDonations: number;
  phone: string | null;
  canContactSecurely: boolean;
}

function DonorsSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Filters from URL
  const initialBloodGroup = searchParams.get("bloodGroup") || "ALL";
  const initialDistrict = searchParams.get("district") || "ALL";
  const initialAvailability = searchParams.get("availability") || "ALL";
  const initialEligible = searchParams.get("eligible") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [bloodGroup, setBloodGroup] = useState(initialBloodGroup);
  const [district, setDistrict] = useState(initialDistrict);
  const [availability, setAvailability] = useState(initialAvailability);
  const [eligibleOnly, setEligibleOnly] = useState(initialEligible === "true");
  const [search, setSearch] = useState(initialSearch);

  const [donors, setDonors] = useState<DonorCardData[]>([]);
  const [districtsList, setDistrictsList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Mobile Filter Drawer Toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Contact Modal State
  const [selectedDonor, setSelectedDonor] = useState<DonorCardData | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [patientName, setPatientName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [unitsNeeded, setUnitsNeeded] = useState("1");
  const [dateNeeded, setDateNeeded] = useState(new Date().toISOString().split("T")[0]);
  const [message, setMessage] = useState("");
  const [submittingContact, setSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Fetch districts for filter dropdown
  useEffect(() => {
    fetch("/api/public/districts")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDistrictsList(data.data.districts);
        }
      });
  }, []);

  // Fetch donors with current filters
  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        bloodGroup,
        district,
        availability,
        eligible: eligibleOnly ? "true" : "ALL",
        search,
      });

      const res = await fetch(`/api/public/donors?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDonors(data.data.donors);
        setTotalPages(data.data.pagination.totalPages);
        setTotalResults(data.data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to load donors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [bloodGroup, district, availability, eligibleOnly, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchDonors();
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonor) return;

    setSubmittingContact(true);
    setContactError(null);

    try {
      const res = await fetch(`/api/public/donors/${selectedDonor.id}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorProfileId: selectedDonor.id,
          requesterName: contactName,
          requesterPhone: contactPhone,
          requesterEmail: contactEmail,
          patientName,
          hospitalName,
          bloodGroupId: selectedDonor.id,
          unitsRequired: parseInt(unitsNeeded, 10) || 1,
          requiredDate: dateNeeded,
          message,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to send contact request");
      }

      setContactSuccess(true);
      setTimeout(() => {
        setContactSuccess(false);
        setSelectedDonor(null);
      }, 2500);
    } catch (err: any) {
      setContactError(err.message || "An error occurred");
    } finally {
      setSubmittingContact(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Overview Banner */}
      <div className="bg-gradient-to-r from-red-50 via-rose-50 to-slate-50 border border-rose-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xs">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
            <span>Kerala Voluntary Donor Registry</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Find a Voluntary Blood Donor
          </h1>
          <p className="text-sm text-slate-600 max-w-xl">
            Privacy-first community directory across 14 Kerala districts. {totalResults} available donors matched your criteria.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a href="/become-a-donor">
            <Button variant="medical" size="sm" className="gap-2 font-bold shadow-md shadow-red-600/20">
              <Heart className="w-4 h-4 fill-white" />
              <span>Register as Donor</span>
            </Button>
          </a>
          <a href="/blood-requests/new">
            <Button variant="outline" size="sm" className="gap-2 font-bold border-red-300 text-red-700 hover:bg-red-50 bg-white">
              <span>Post Urgent Need &rarr;</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="sm:hidden w-full">
        <Button
          variant="outline"
          className="w-full gap-2 border-slate-300 font-semibold"
          onClick={() => setMobileFilterOpen(true)}
        >
          <Filter className="w-4 h-4 text-red-600" />
          <span>Filters & Search ({totalResults} results)</span>
        </Button>
      </div>

      {/* Main Grid: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-xs sticky top-24">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-red-600" />
                  Filter Directory
                </span>
                {(bloodGroup !== "ALL" || district !== "ALL" || search !== "") && (
                  <button
                    onClick={() => {
                      setBloodGroup("ALL");
                      setDistrict("ALL");
                      setAvailability("ALL");
                      setEligibleOnly(false);
                      setSearch("");
                      setPage(1);
                    }}
                    className="text-xs text-red-600 hover:underline font-normal"
                  >
                    Reset
                  </button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-5">
              {/* Search by Text */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Keyword / Area
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <Input
                    placeholder="Locality, name, hospital..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchDonors()}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Blood Group Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Blood Group
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["ALL", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => {
                        setBloodGroup(bg);
                        setPage(1);
                      }}
                      className={`h-8 rounded-lg text-xs font-bold border transition-all ${
                        bloodGroup === bg
                          ? "bg-red-600 border-red-600 text-white shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {bg}
                    </button>
                  ))}
                </div>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Kerala District
                </label>
                <select
                  value={district}
                  onChange={(e) => {
                    setDistrict(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="ALL">All Districts (14)</option>
                  {districtsList.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => {
                    setAvailability(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available Now</option>
                  <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
                </select>
              </div>

              {/* Eligible Only Checkbox */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={eligibleOnly}
                    onChange={(e) => {
                      setEligibleOnly(e.target.checked);
                      setPage(1);
                    }}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300"
                  />
                  <span>Show only donors currently eligible by donation interval</span>
                </label>
              </div>

              <Button
                variant="default"
                size="sm"
                className="w-full font-bold bg-red-600 hover:bg-red-700"
                onClick={fetchDonors}
              >
                Apply Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Donors Grid Results */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-6 border-slate-200 animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-8 bg-slate-200 rounded-lg" />
                    <div className="w-16 h-5 bg-slate-200 rounded-full" />
                  </div>
                  <div className="w-3/4 h-5 bg-slate-200 rounded" />
                  <div className="w-1/2 h-4 bg-slate-200 rounded" />
                  <div className="w-full h-9 bg-slate-200 rounded-lg mt-4" />
                </Card>
              ))}
            </div>
          ) : donors.length === 0 ? (
            <Card className="border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-red-600 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Donors Found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                No verified voluntary donors matched your filter settings. Try broadening your district or blood group filters.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setBloodGroup("ALL");
                  setDistrict("ALL");
                  setAvailability("ALL");
                  setEligibleOnly(false);
                  setSearch("");
                }}
              >
                Reset All Filters
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {donors.map((donor) => (
                <Card
                  key={donor.id}
                  className="rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-red-200 transition-all hover:-translate-y-1 duration-300 flex flex-col justify-between bg-white overflow-hidden group"
                >
                  <CardContent className="p-6 space-y-4 flex-1">
                    {/* Top Row: Blood Group & Status */}
                    <div className="flex items-center justify-between">
                      <BloodGroupBadge group={donor.bloodGroup} size="lg" />
                      <StatusBadge status={donor.availabilityStatus} type="availability" />
                    </div>

                    {/* Donor Identity with Avatar */}
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-100 to-rose-50 border border-rose-100 flex items-center justify-center font-black text-slate-800 text-sm shadow-xs shrink-0">
                        {donor.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5 truncate">
                          <span className="truncate">{donor.name}</span>
                          <span title="Verified Donor">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{donor.locality ? `${donor.locality}, ` : ""}{donor.district}</span>
                        </div>
                      </div>
                    </div>

                    {/* Eligibility Badge */}
                    <div className="pt-2 border-t border-slate-100 text-xs">
                      {donor.isEligible ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Eligible to Donate Right Now</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50/80 px-2.5 py-1.5 rounded-xl border border-amber-100">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {donor.nextEligibleDonationDate
                              ? `Wait until ${formatDate(donor.nextEligibleDonationDate)}`
                              : "Not yet eligible"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Direct phone if opted-in */}
                    {donor.phone && (
                      <div className="text-xs text-slate-800 flex items-center justify-between bg-slate-50 p-2.5 rounded-xl font-mono border border-slate-100">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-red-500" />
                          <span>{donor.phone}</span>
                        </span>
                        <a href={`tel:${donor.phone}`} className="text-xs font-bold text-red-600 hover:underline">
                          Call
                        </a>
                      </div>
                    )}
                  </CardContent>

                  {/* Card Footer Action */}
                  <div className="p-6 pt-0">
                    <Button
                      variant="medical"
                      size="sm"
                      className="w-full gap-2 font-black justify-center shadow-md shadow-red-600/20 hover:shadow-red-600/35 hover:scale-[1.02] transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedDonor(donor);
                        setContactSuccess(false);
                        setContactError(null);
                      }}
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Contact Donor</span>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
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
        </div>
      </div>

      {/* SECURE CONTACT DONOR MODAL */}
      {selectedDonor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <BloodGroupBadge group={selectedDonor.bloodGroup} size="sm" />
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Contact {selectedDonor.name}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedDonor.district}, Kerala</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDonor(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Request Sent Successfully!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your blood requirement has been securely delivered to {selectedDonor.name}. They will review the details and contact you directly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  To protect donor privacy from spam, requests are delivered securely through the portal. Please provide patient and hospital verification details.
                </p>

                {contactError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {contactError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="Attendant / Requester"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Your Phone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+91 98460 00000"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="Patient full name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Hospital & City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. General Hospital, Kochi"
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Units Needed
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={unitsNeeded}
                      onChange={(e) => setUnitsNeeded(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Date Required <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={dateNeeded}
                      onChange={(e) => setDateNeeded(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Email (for notification)
                  </label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Emergency Message / Case Notes
                  </label>
                  <Textarea
                    placeholder="Brief description of surgery or transfusion emergency..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedDonor(null)}
                    disabled={submittingContact}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="medical"
                    disabled={submittingContact}
                    className="gap-2 font-bold"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingContact ? "Sending..." : "Submit Secure Request"}</span>
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DonorsSearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading donor search directory...</div>}>
      <DonorsSearchContent />
    </Suspense>
  );
}
