import React from "react";
import prisma from "@/lib/prisma";
import { Calendar, Plus, MapPin, Users, Phone, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.donationEvent.findMany({
    orderBy: { startDate: "desc" },
    include: {
      district: { select: { name: true } },
      _count: { select: { registrations: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Donation Camps & Community Drives
          </h2>
          <p className="text-sm text-slate-500">
            Organize voluntary donation camps, monitor participant registrations, and publish regional drives.
          </p>
        </div>

        <a href="/admin/events/new">
          <Button variant="medical" size="sm" className="gap-1.5 font-bold">
            <Plus className="w-4 h-4" />
            <span>Create Donation Camp</span>
          </Button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  {event.status}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(event.startDate)}
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 mt-2">
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-slate-600 line-clamp-2 text-xs leading-relaxed">
                {event.description}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="font-medium text-slate-800">{event.venue}, {event.district.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    <strong>{event.registeredCount}</strong> registered / Target: <strong>{event.targetUnits} units</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{event.organizerName} ({event.organizerPhone})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
