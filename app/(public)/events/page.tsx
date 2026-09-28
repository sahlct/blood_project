"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Users,
  Phone,
  Clock,
  CheckCircle2,
  Heart,
  X,
  Send,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  venue: string;
  district: string;
  city: string | null;
  address: string;
  startDate: string;
  endDate: string;
  targetUnits: number;
  registeredCount: number;
  organizerName: string;
  organizerPhone: string;
  status: string;
}

export default function DonationCampsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [bloodGroups, setBloodGroups] = useState<{ id: string; group: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Registration modal state
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [bloodGroupId, setBloodGroupId] = useState("");
  const [registering, setRegistering] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/public/events").then((r) => r.json()),
      fetch("/api/public/blood-groups").then((r) => r.json()),
    ]).then(([eventsData, bgData]) => {
      if (eventsData.success) setEvents(eventsData.data.events);
      if (bgData.success) setBloodGroups(bgData.data.bloodGroups);
      setLoading(false);
    });
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setRegistering(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/public/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          fullName: name,
          phone,
          email,
          bloodGroupId,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to register for camp");
      }

      setSuccessMessage("You are successfully registered! We look forward to seeing you at the camp.");
      // Increment local count
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === selectedEvent.id ? { ...ev, registeredCount: ev.registeredCount + 1 } : ev
        )
      );
      setTimeout(() => {
        setSuccessMessage(null);
        setSelectedEvent(null);
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred");
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Upcoming Blood Donation Camps & Drives
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Join community-driven blood donation camps across Kerala colleges, hospitals, and youth centers. Every donor receives free refreshments, hemoglobin check, and a voluntary donor certificate.
        </p>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading upcoming donation camps...</div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center text-slate-500 border-slate-200">
          No upcoming donation camps currently scheduled. Check back soon or contact your local hospital.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map((event) => (
            <Card
              key={event.id}
              className="border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    {event.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(event.startDate)}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mt-2">
                  {event.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-xs text-slate-600 flex-1">
                <p className="text-sm leading-relaxed text-slate-600">
                  {event.description}
                </p>

                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">{event.venue}</span>
                      <span className="text-slate-500 text-[11px] block">{event.address}, {event.district}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>
                      Registered Donors: <strong className="text-slate-900">{event.registeredCount}</strong> / Target: <strong className="text-slate-900">{event.targetUnits} units</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Organizer: {event.organizerName} ({event.organizerPhone})</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    variant="medical"
                    size="lg"
                    className="w-full font-bold justify-center gap-2 shadow-md shadow-red-500/20"
                    onClick={() => {
                      setSelectedEvent(event);
                      setSuccessMessage(null);
                      setErrorMessage(null);
                    }}
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Register to Donate at this Camp &rarr;</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* EVENT REGISTRATION MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Register for Camp
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-[280px]">
                  {selectedEvent.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMessage ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Registration Confirmed!</h4>
                <p className="text-xs text-slate-600">{successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Anjali Menon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="tel"
                      placeholder="+91 98460 00000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Blood Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bloodGroupId}
                      onChange={(e) => setBloodGroupId(e.target.value)}
                      required
                      className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Select</option>
                      {bloodGroups.map((bg) => (
                        <option key={bg.id} value={bg.id}>
                          {bg.group}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="anjali@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedEvent(null)}
                    disabled={registering}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="medical"
                    disabled={registering}
                    className="font-bold"
                  >
                    {registering ? "Registering..." : "Confirm Camp Registration"}
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
