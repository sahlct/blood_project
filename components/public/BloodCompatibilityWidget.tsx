"use client";

import React, { useState } from "react";
import { Droplet, ArrowRight, ShieldCheck, Heart, Info, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CompatibilityInfo {
  group: string;
  rh: string;
  givesTo: string[];
  receivesFrom: string[];
  rarityInIndia: string;
  isUniversalDonor?: boolean;
  isUniversalRecipient?: boolean;
  description: string;
}

const COMPATIBILITY_DATA: Record<string, CompatibilityInfo> = {
  "O-": {
    group: "O",
    rh: "-",
    givesTo: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    receivesFrom: ["O-"],
    rarityInIndia: "~1.5% (Very Rare)",
    isUniversalDonor: true,
    description: "Universal Red Cell Donor. Can safely be transfused to patients of ANY blood type in trauma & neonatal emergencies.",
  },
  "O+": {
    group: "O",
    rh: "+",
    givesTo: ["O+", "A+", "B+", "AB+"],
    receivesFrom: ["O+", "O-"],
    rarityInIndia: "~38% (Most Common)",
    description: "The most commonly needed blood type in India. Crucial for regular surgeries, accidents, and routine transfusions.",
  },
  "A-": {
    group: "A",
    rh: "-",
    givesTo: ["A-", "A+", "AB-", "AB+"],
    receivesFrom: ["A-", "O-"],
    rarityInIndia: "~0.8% (Extremely Rare)",
    description: "Rare blood type. Your donations are indispensable for Rh-negative surgery patients and pregnant mothers.",
  },
  "A+": {
    group: "A",
    rh: "+",
    givesTo: ["A+", "AB+"],
    receivesFrom: ["A+", "A-", "O+", "O-"],
    rarityInIndia: "~21% (High Demand)",
    description: "High demand across Kerala hospitals for platelet and whole blood requirements for oncology and cardiac care.",
  },
  "B-": {
    group: "B",
    rh: "-",
    givesTo: ["B-", "B+", "AB-", "AB+"],
    receivesFrom: ["B-", "O-"],
    rarityInIndia: "~1.2% (Very Rare)",
    description: "Rare Rh-negative type. Hospitals often face critical shortages during emergencies requiring urgent community search.",
  },
  "B+": {
    group: "B",
    rh: "+",
    givesTo: ["B+", "AB+"],
    receivesFrom: ["B+", "B-", "O+", "O-"],
    rarityInIndia: "~32% (Widely Needed)",
    description: "Second most prevalent blood type in India. Consistently required for trauma cases, thalassaemia patients, and surgeries.",
  },
  "AB-": {
    group: "AB",
    rh: "-",
    givesTo: ["AB-", "AB+"],
    receivesFrom: ["AB-", "A-", "B-", "O-"],
    rarityInIndia: "~0.5% (Rarest in India)",
    description: "The rarest blood type in India. Maintaining an active community registry of AB- donors is vital to save lives.",
  },
  "AB+": {
    group: "AB",
    rh: "+",
    givesTo: ["AB+"],
    receivesFrom: ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
    rarityInIndia: "~5.0% (Universal Recipient)",
    isUniversalRecipient: true,
    description: "Universal Red Cell Recipient. Can safely receive red blood cells from any ABO blood group.",
  },
};

const GROUPS_LIST = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

export function BloodCompatibilityWidget() {
  const [selectedGroup, setSelectedGroup] = useState<string>("O-");
  const data = COMPATIBILITY_DATA[selectedGroup];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 mb-2">
              <Droplet className="w-3.5 h-3.5 fill-red-400 text-red-400" />
              <span>Interactive Compatibility Engine</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Who Can You Help? <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400">Match Matrix</span>
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Select any ABO/Rh blood type to view live red cell compatibility and regional demand across Kerala.
            </p>
          </div>

          <a href={`/donors?bloodGroup=${selectedGroup}`}>
            <Button variant="medical" size="sm" className="gap-2 font-bold shadow-lg shadow-red-600/25">
              <span>Find {selectedGroup} Donors</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>

        {/* Group Selector Pill Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Blood Group:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {GROUPS_LIST.map((bg) => {
              const isSelected = selectedGroup === bg;
              const isUniversal = bg === "O-" || bg === "AB+";
              return (
                <button
                  key={bg}
                  onClick={() => setSelectedGroup(bg)}
                  className={`relative p-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-b from-red-600 to-rose-700 text-white font-black shadow-lg shadow-red-600/40 ring-2 ring-red-400 scale-105"
                      : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-bold border border-slate-700/60 hover:text-white"
                  }`}
                >
                  <span className="text-lg tracking-tight">{bg}</span>
                  {isUniversal && (
                    <span className="text-[9px] font-semibold opacity-85 mt-0.5 tracking-tight uppercase">
                      {bg === "O-" ? "Universal" : "Recipient"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Detail Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          {/* Column 1: Profile & Key Highlights */}
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl font-black text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center text-sm">
                    {data.group}
                  </span>
                  <span>{selectedGroup}</span>
                </span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
                  {data.rarityInIndia}
                </span>
              </div>

              {data.isUniversalDonor && (
                <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Universal Red Blood Cell Donor</span>
                </div>
              )}

              {data.isUniversalRecipient && (
                <div className="mb-3 px-3 py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2">
                  <Heart className="w-4 h-4 shrink-0 text-purple-400" />
                  <span>Universal Red Blood Cell Recipient</span>
                </div>
              )}

              <p className="text-xs text-slate-300 leading-relaxed">
                {data.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Based on ABO and Rh(D) antigen compatibility protocols.</span>
            </div>
          </div>

          {/* Column 2: You Can Give To */}
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>Can Give Red Blood Cells To:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {GROUPS_LIST.map((bg) => {
                const canGive = data.givesTo.includes(bg);
                return (
                  <span
                    key={bg}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      canGive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-slate-900/60 text-slate-600 border border-slate-800 line-through opacity-50"
                    }`}
                  >
                    {canGive ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{bg}</span>
                  </span>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 pt-2">
              Donating whole blood or double red cells will directly benefit emergency patients with these blood types.
            </p>
          </div>

          {/* Column 3: You Can Receive From */}
          <div className="bg-slate-800/60 rounded-2xl p-6 border border-slate-700/60 space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Droplet className="w-4 h-4 fill-sky-400 text-sky-400" />
              <span>Can Safely Receive From:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {GROUPS_LIST.map((bg) => {
                const canReceive = data.receivesFrom.includes(bg);
                return (
                  <span
                    key={bg}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      canReceive
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        : "bg-slate-900/60 text-slate-600 border border-slate-800 line-through opacity-50"
                    }`}
                  >
                    {canReceive ? <Check className="w-3.5 h-3.5 text-sky-400" /> : <X className="w-3.5 h-3.5 text-slate-600" />}
                    <span>{bg}</span>
                  </span>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 pt-2">
              In clinical settings, patient serum is cross-matched against donor cells to ensure 100% biological compatibility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
