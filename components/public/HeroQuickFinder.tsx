"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Droplet, ArrowRight, ShieldCheck, HeartHandshake, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DistrictItem {
  id: string;
  name: string;
}

interface BloodGroupItem {
  id: string;
  group: string;
}

interface HeroQuickFinderProps {
  districts: DistrictItem[];
  bloodGroups: BloodGroupItem[];
}

export function HeroQuickFinder({ districts, bloodGroups }: HeroQuickFinderProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"search" | "emergency">("search");
  const [selectedGroup, setSelectedGroup] = useState<string>("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");
  const [keyword, setKeyword] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedGroup !== "ALL") params.set("bloodGroup", selectedGroup);
    if (selectedDistrict !== "ALL") params.set("district", selectedDistrict);
    if (keyword.trim()) params.set("search", keyword.trim());
    router.push(`/donors?${params.toString()}`);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-100/80 relative">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl mb-6 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab("search")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "search"
              ? "bg-white text-slate-900 shadow-md font-black"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Search className="w-4 h-4 text-red-600" />
          <span>Find Voluntary Donor</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("emergency")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "emergency"
              ? "bg-red-600 text-white shadow-md shadow-red-600/30 font-black"
              : "text-slate-600 hover:text-red-600"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span>Urgent Hospital Need</span>
        </button>
      </div>

      {activeTab === "search" ? (
        <form onSubmit={handleSearch} className="space-y-5">
          {/* Quick Blood Group Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Required Blood Group:
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedGroup("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGroup === "ALL"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                All Groups
              </button>
              {bloodGroups.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setSelectedGroup(bg.group)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGroup === bg.group
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-105"
                      : "bg-rose-50 hover:bg-rose-100 text-red-700 border border-rose-200/60"
                  }`}
                >
                  {bg.group}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields: District & Search Term */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Kerala District
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="ALL">All 14 Districts (Kerala)</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Locality / Town / Hospital
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Kakkanad, Aluva, Calicut Medical College..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Direct voluntary donor connections. 100% privacy protected.</span>
            </div>

            <Button
              type="submit"
              variant="medical"
              size="lg"
              className="w-full sm:w-auto gap-2 px-8 font-black shadow-lg shadow-red-600/30 cursor-pointer"
            >
              <span>Search Verified Donors</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      ) : (
        /* Emergency Tab Content */
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-ping mt-1 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-red-900">
                Critical Emergency Blood Requirement?
              </h4>
              <p className="text-xs text-red-700 mt-1">
                Post an immediate broadcast request to voluntary donors across Kerala or contact our 24/7 volunteer response desk.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="/blood-requests/new"
              className="p-5 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white hover:shadow-xl hover:shadow-red-600/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-200">Self-Service</span>
                <h5 className="text-lg font-black text-white mt-1 group-hover:underline">
                  Post Emergency Request &rarr;
                </h5>
                <p className="text-xs text-rose-100 mt-1">
                  Fill hospital, units, and patient details. Alerts matching active donors immediately.
                </p>
              </div>
              <span className="text-xs font-bold text-white mt-4 inline-flex items-center gap-1.5">
                Takes ~60 seconds &rarr;
              </span>
            </a>

            <div className="p-5 rounded-2xl bg-slate-900 text-white flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Emergency Helpline</span>
                <h5 className="text-lg font-black text-white mt-1 flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-red-400" />
                  <span>+91 98765 43210</span>
                </h5>
                <p className="text-xs text-slate-400 mt-1">
                  24/7 volunteer emergency coordinators on standby for trauma and ICU cases.
                </p>
              </div>
              <a
                href="tel:+919876543210"
                className="mt-4 text-xs font-bold text-red-400 hover:text-red-300 underline"
              >
                Call Rapid Response Hotline &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
