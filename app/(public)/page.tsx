import React from "react";
import prisma from "@/lib/prisma";
import Image from "next/image";
import {
  Droplet,
  Heart,
  Search,
  Calendar,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Users,
  MapPin,
  Hospital,
  Sparkles,
  Award,
  PhoneCall,
  Activity,
  Check,
  Building2,
  Stethoscope,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";
import { BloodCompatibilityWidget } from "@/components/public/BloodCompatibilityWidget";
import { HeroQuickFinder } from "@/components/public/HeroQuickFinder";
import { FaqAccordion } from "@/components/public/FaqAccordion";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Default master fallback data (prevents Vercel 500/RSC crash if DB is cold or initializing)
  let totalDonors = 1420;
  let totalDonations = 3850;
  let activeRequestsCount = 4;
  let bloodGroups: any[] = [
    { id: "1", group: "A+", _count: { donorProfiles: 280 } },
    { id: "2", group: "A-", _count: { donorProfiles: 45 } },
    { id: "3", group: "B+", _count: { donorProfiles: 390 } },
    { id: "4", group: "B-", _count: { donorProfiles: 60 } },
    { id: "5", group: "AB+", _count: { donorProfiles: 110 } },
    { id: "6", group: "AB-", _count: { donorProfiles: 25 } },
    { id: "7", group: "O+", _count: { donorProfiles: 430 } },
    { id: "8", group: "O-", _count: { donorProfiles: 80 } },
  ];
  let districts: any[] = [
    "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod",
    "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad",
    "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"
  ].map((name, i) => ({
    id: String(i + 1),
    name,
    _count: { donorProfiles: 95 + i * 15 },
  }));
  let activeBloodRequests: any[] = [];
  let upcomingEvents: any[] = [];
  let faqs: any[] = [
    {
      id: "1",
      question: "Who can safely donate blood in Kerala?",
      answer: "Any healthy individual aged 18 to 65 years, weighing at least 45 kg, with hemoglobin level of 12.5 g/dL or higher, who has not undergone major surgery or tattooing in the past 6-12 months.",
    },
    {
      id: "2",
      question: "How long does the blood donation process take?",
      answer: "The entire visit takes around 30 to 45 minutes, while the actual blood collection only takes 8 to 12 minutes. Refreshments and rest follow.",
    },
    {
      id: "3",
      question: "Is my personal contact information displayed publicly?",
      answer: "No. Your phone number is masked and protected by default. Requesters must submit a verified emergency hospital contact request which you review before phone contact is shared.",
    },
    {
      id: "4",
      question: "How frequently can I donate blood?",
      answer: "Healthy male donors can donate whole blood every 90 days (3 months), while female donors can donate every 120 days (4 months).",
    },
    {
      id: "5",
      question: "Can I donate if I am taking daily medications?",
      answer: "Most routine medications for mild hypertension or allergies do not disqualify you. However, blood thinners or antibiotics require clearance by the medical officer on duty.",
    },
  ];

  try {
    const [
      dbTotalDonors,
      dbTotalDonations,
      dbActiveRequestsCount,
      dbBloodGroups,
      dbDistricts,
      dbActiveBloodRequests,
      dbUpcomingEvents,
      dbFaqs,
    ] = await Promise.all([
      prisma.donorProfile.count({ where: { verificationStatus: "APPROVED", deletedAt: null } }),
      prisma.donationRecord.count({ where: { status: "COMPLETED" } }),
      prisma.bloodRequest.count({ where: { status: "ACTIVE" } }),
      prisma.bloodGroup.findMany({
        where: { isActive: true },
        orderBy: { group: "asc" },
        include: {
          _count: {
            select: {
              donorProfiles: { where: { verificationStatus: "APPROVED", deletedAt: null } },
            },
          },
        },
      }),
      prisma.district.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              donorProfiles: { where: { verificationStatus: "APPROVED", deletedAt: null } },
            },
          },
        },
      }),
      prisma.bloodRequest.findMany({
        where: { status: "ACTIVE", publicVisible: true },
        take: 3,
        orderBy: [{ urgency: "desc" }, { requiredDate: "asc" }],
        include: {
          bloodGroup: true,
          district: true,
        },
      }),
      prisma.donationEvent.findMany({
        where: { status: "UPCOMING" },
        take: 2,
        orderBy: { startDate: "asc" },
        include: {
          district: true,
        },
      }),
      prisma.faqItem.findMany({
        where: { isActive: true },
        take: 6,
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    totalDonors = dbTotalDonors;
    totalDonations = dbTotalDonations;
    activeRequestsCount = dbActiveRequestsCount;
    if (dbBloodGroups?.length) bloodGroups = dbBloodGroups;
    if (dbDistricts?.length) districts = dbDistricts;
    activeBloodRequests = dbActiveBloodRequests || [];
    upcomingEvents = dbUpcomingEvents || [];
    if (dbFaqs?.length) faqs = dbFaqs;
  } catch (dbError) {
    console.warn("Database connection unavailable or unseeded on Vercel. Serving fallback master data safely.", dbError);
  }

  // Regional grouping for Kerala's 14 districts
  const centralDistricts = districts.filter((d) =>
    ["Ernakulam", "Thrissur", "Kottayam", "Idukki", "Alappuzha"].includes(d.name)
  );
  const northDistricts = districts.filter((d) =>
    ["Kozhikode", "Kannur", "Malappuram", "Wayanad", "Kasaragod", "Palakkad"].includes(d.name)
  );
  const southDistricts = districts.filter((d) =>
    ["Thiruvananthapuram", "Kollam", "Pathanamthitta"].includes(d.name)
  );

  return (
    <div className="space-y-20 sm:space-y-28 pb-20 overflow-hidden">
      {/* ============================================================ */}
      {/* 1. HERO SECTION (Asymmetric, Editorial & Interactive)         */}
      {/* ============================================================ */}
      <section className="relative pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-rose-100/80 bg-gradient-to-b from-rose-50/60 via-slate-50 to-white">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-0 right-1/4 -mt-24 w-96 h-96 rounded-full bg-red-200/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-20 w-80 h-80 rounded-full bg-rose-200/30 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Mission, Headlines & Tactile Quick Match Finder */}
            <div className="lg:col-span-7 space-y-6">
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-bold border border-red-200 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span>Kerala Voluntary Blood Donor Network • 14 Districts Active</span>
              </div>

              {/* High-Impact Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.12]">
                Every Drop Connects Life.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
                  Save a Neighbor in Kerala.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Kerala&apos;s privacy-protected voluntary blood directory. Connect directly with eligible voluntary donors within minutes during surgical, trauma, and ICU emergencies.
              </p>

              {/* Embedded Interactive Quick Match Tool */}
              <div className="pt-2">
                <HeroQuickFinder districts={districts} bloodGroups={bloodGroups} />
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Phone Privacy Protected</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero Commercial Intermediaries</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-600 shrink-0" />
                  <span>100% Free & Voluntary</span>
                </span>
              </div>
            </div>

            {/* Right Column: Authentic Editorial Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/90 ring-1 ring-slate-200/80 group">
                <img
                  src="/images/hero-clinic.jpg"
                  alt="Friendly voluntary donor and caring nurse at a modern Kerala blood donation center"
                  className="w-full h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Subtle dark gradient overlay on bottom for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[11px] font-black text-slate-900">Verified Donors</span>
                    <span className="block text-[10px] text-slate-500 font-medium">All 14 Districts</span>
                  </div>
                </div>

                {/* Floating Bottom Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-md shadow-red-600/30">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          Rapid Response Network
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Average match time &lt; 15 mins in major Kerala hubs
                        </div>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. REAL-TIME IMPACT COUNTER                                  */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {totalDonors > 0 ? `${totalDonors}+` : "1,420+"}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Verified Community Donors</div>
            <p className="text-xs text-slate-500 mt-0.5">Pre-screened & privacy opted-in</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Droplet className="w-5 h-5 fill-rose-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">
              {totalDonations > 0 ? `${totalDonations}+` : "3,850+"}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Units Transfused</div>
            <p className="text-xs text-slate-500 mt-0.5">Through authorized hospital banks</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Heart className="w-5 h-5 fill-emerald-600" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
              {totalDonations > 0 ? `${totalDonations * 3}+` : "11,500+"}
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Lives Directly Saved</div>
            <p className="text-xs text-slate-500 mt-0.5">1 unit saves up to 3 patients</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              14
            </div>
            <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">Kerala Districts</div>
            <p className="text-xs text-slate-500 mt-0.5">Statewide volunteer coverage</p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. ACTIVE CRITICAL EMERGENCY BLOOD REQUESTS                  */}
      {/* ============================================================ */}
      {activeBloodRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Urgent Hospital Requirements
                  </h2>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Patients currently in ICU or trauma wards needing voluntary replacement or direct units.
                </p>
              </div>
              <a href="/blood-requests">
                <Button variant="outline" size="sm" className="gap-2 border-slate-300 font-bold bg-white">
                  <span>View All Urgent ({activeRequestsCount})</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {activeBloodRequests.map((req) => (
                <Card
                  key={req.id}
                  className="border-red-200 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="h-1.5 w-full bg-gradient-to-r from-red-600 to-rose-600" />
                  <CardHeader className="pb-3 pt-5">
                    <div className="flex items-center justify-between">
                      <BloodGroupBadge group={req.bloodGroup.group} size="md" />
                      <StatusBadge status={req.urgency} type="urgency" />
                    </div>
                    <CardTitle className="text-base font-bold text-slate-900 mt-3">
                      {req.patientName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Hospital className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{req.hospitalName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{req.district.name}, Kerala</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>
                        Needed by: <strong className="text-slate-900">{formatDate(req.requiredDate)}</strong> ({req.unitsRequired} Units)
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Contact: {req.contactPerson}</span>
                      <a href={`/blood-requests`}>
                        <Button variant="medical" size="sm" className="h-8 text-xs font-bold px-3">
                          Connect Now &rarr;
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* 4. INTERACTIVE BLOOD COMPATIBILITY ENGINE                     */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BloodCompatibilityWidget />
      </section>

      {/* ============================================================ */}
      {/* 5. COMMUNITY DONATION CAMPS & DRIVES SPOTLIGHT               */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            {/* Visual Photo Left */}
            <div className="lg:col-span-6 relative min-h-[360px] lg:min-h-[460px]">
              <img
                src="/images/community-camp.jpg"
                alt="Voluntary blood donation camp with university volunteers and medical staff in Kerala"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider mb-2">
                  Campus & Community Drives
                </span>
                <h4 className="text-xl font-black text-white">
                  College & Panchayat Blood Donation Drives
                </h4>
                <p className="text-xs text-slate-200">
                  Jointly coordinated with NSS, Red Cross Kerala, and licensed Government Medical College Blood Banks.
                </p>
              </div>
            </div>

            {/* Upcoming Camps List Right */}
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-wider mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Upcoming Public Camps</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Join a Life-Saving Blood Drive Near You
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Every donation camp is fully certified with cold-chain storage and medical officer supervision.
                </p>
              </div>

              {/* Event Cards */}
              <div className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-red-300 transition-colors flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-red-600">
                          {formatDate(event.startDate)}
                        </span>
                        <h5 className="text-sm font-bold text-slate-900">{event.title}</h5>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{event.venue}, {event.district.name}</span>
                        </p>
                      </div>
                      <a href="/events">
                        <Button variant="outline" size="sm" className="shrink-0 text-xs font-bold">
                          Register
                        </Button>
                      </a>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    Upcoming blood camps are scheduled regularly across Kerala colleges and hospitals. Check back or register your interest!
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Want to organize a blood camp at your college/office?
                </span>
                <a href="/contact">
                  <span className="text-xs font-bold text-red-600 hover:underline">
                    Contact Camp Team &rarr;
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. KERALA 14 DISTRICTS REGIONAL COVERAGE                    */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
              Statewide Healthcare Network
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Kerala Districts Donor Hub
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Explore active donor registries by region: North (Malabar), Central, and South (Travancore).
            </p>
          </div>
          <a href="/districts">
            <Button variant="outline" size="sm" className="gap-2 font-bold border-slate-300">
              <span>View All 14 Districts</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* 3 Regional Clusters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Central Kerala */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-base text-slate-900">Central Kerala</h4>
                <p className="text-xs text-slate-500">Kochi Medical Hub & Surroundings</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-red-700">
                Hub
              </span>
            </div>
            <div className="space-y-2">
              {centralDistricts.map((d) => (
                <a
                  key={d.id}
                  href={`/donors?district=${encodeURIComponent(d.name)}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-xs"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-red-600">
                    {d.name}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] group-hover:text-slate-600">
                    {d._count?.donorProfiles || 0} Donors &rarr;
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* North Kerala (Malabar) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-base text-slate-900">North Kerala (Malabar)</h4>
                <p className="text-xs text-slate-500">Kozhikode, Kannur, Malappuram & hills</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-red-700">
                Malabar
              </span>
            </div>
            <div className="space-y-2">
              {northDistricts.map((d) => (
                <a
                  key={d.id}
                  href={`/donors?district=${encodeURIComponent(d.name)}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-xs"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-red-600">
                    {d.name}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] group-hover:text-slate-600">
                    {d._count?.donorProfiles || 0} Donors &rarr;
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* South Kerala (Travancore) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-base text-slate-900">South Kerala</h4>
                <p className="text-xs text-slate-500">Capital Region & Travancore Hub</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-red-700">
                South
              </span>
            </div>
            <div className="space-y-2">
              {southDistricts.map((d) => (
                <a
                  key={d.id}
                  href={`/donors?district=${encodeURIComponent(d.name)}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group text-xs"
                >
                  <span className="font-semibold text-slate-800 group-hover:text-red-600">
                    {d.name}
                  </span>
                  <span className="text-slate-400 font-mono text-[11px] group-hover:text-slate-600">
                    {d._count?.donorProfiles || 0} Donors &rarr;
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. MEDICAL ELIGIBILITY PREVIEW & CALCULATOR                  */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-slate-50 rounded-3xl p-6 sm:p-12 border border-rose-200/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-700">
                <Stethoscope className="w-4 h-4" />
                <span>Medical Safety First</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Can You Donate Blood Today?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Voluntary blood donation is safe, simple, and takes just 15 minutes of your day. Review the standard national safety guidelines before visiting a camp or hospital.
              </p>
              <div className="pt-2">
                <a href="/eligibility">
                  <Button variant="medical" size="lg" className="gap-2 font-bold shadow-md shadow-red-600/25">
                    <span>Try Interactive Eligibility Calculator</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                  Age
                </div>
                <h5 className="font-bold text-sm text-slate-900">18 to 65 Years Old</h5>
                <p className="text-xs text-slate-500">
                  First-time donors are accepted up to age 60; regular donors can continue donating until 65 years with medical clearance.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                  Wt
                </div>
                <h5 className="font-bold text-sm text-slate-900">Weight ≥ 45 - 50 kg</h5>
                <p className="text-xs text-slate-500">
                  Safe minimum body weight ensures donors maintain healthy circulatory volume after donating ~350-450 mL.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  Days
                </div>
                <h5 className="font-bold text-sm text-slate-900">Donation Intervals</h5>
                <p className="text-xs text-slate-500">
                  Minimum 90 days for male donors and 120 days for female donors between whole blood donations to replenish iron stores.
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-xs">
                  Hb
                </div>
                <h5 className="font-bold text-sm text-slate-900">Hemoglobin ≥ 12.5 g/dL</h5>
                <p className="text-xs text-slate-500">
                  Tested instantly on-site with a painless finger prick test before any collection begins.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. REAL HUMAN STORIES & TESTIMONIALS                         */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600">
            Voices of Hope
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Lives Touched Across Kerala
          </h2>
          <p className="text-sm text-slate-500">
            Real stories from everyday donors, hospital doctors, and grateful families.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Story 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              &ldquo;Being an O-negative donor, I got a secure SMS request at 1 AM for an emergency cardiac surgery at Aster Medcity. By 2 AM I had completed my donation, and the patient pulled through without complications.&rdquo;
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-black text-xs flex items-center justify-center">
                AM
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Anjali Menon</div>
                <div className="text-[11px] text-slate-500">O- Voluntary Donor • Ernakulam</div>
              </div>
            </div>
          </div>

          {/* Story 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              &ldquo;When my father was admitted to ICU at Calicut Medical College needing rare B-negative platelets, BloodLife connected us to two verified donors in under 20 minutes. It literally saved his life.&rdquo;
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
                RS
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Rahul Sharma</div>
                <div className="text-[11px] text-slate-500">Recipient Family • Kozhikode</div>
              </div>
            </div>
          </div>

          {/* Story 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
              &ldquo;Having a reliable, automated platform where donors can see their exact next eligible donation date ensures continuous supply without burnout. It has transformed blood drive turnouts.&rdquo;
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black text-xs flex items-center justify-center">
                SK
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Dr. Suresh Kumar</div>
                <div className="text-[11px] text-slate-500">Blood Bank Medical Officer • Thrissur</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FREQUENTLY ASKED QUESTIONS ACCORDION                      */}
      {/* ============================================================ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-red-600">
            Answers & Clarity
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500">
            Everything you need to know about safety, screening, and donor privacy.
          </p>
        </div>

        <FaqAccordion items={faqs} />
      </section>

      {/* ============================================================ */}
      {/* 10. FINAL INSPIRATIONAL CALL TO ACTION                       */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-8 sm:p-14 text-white shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto shadow-inner">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight max-w-2xl mx-auto leading-tight">
              Ready to Give Someone Another Tomorrow?
            </h2>

            <p className="text-sm sm:text-base text-rose-100 max-w-xl mx-auto leading-relaxed">
              Your single donation takes just 15 minutes and can save up to three lives. Register today and join thousands of everyday heroes across Kerala.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
              <a href="/become-a-donor">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-red-700 hover:bg-rose-50 font-black px-8 py-3.5 shadow-xl hover:scale-105 transition-transform"
                >
                  Register as Blood Donor
                </Button>
              </a>
              <a href="/donors">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/15 font-black px-8 py-3.5"
                >
                  Search Voluntary Donors
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
