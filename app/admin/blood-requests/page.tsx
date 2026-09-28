"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, XCircle, Clock, Phone, MapPin, Hospital, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BloodGroupBadge } from "@/components/common/BloodGroupBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/utils";

interface BloodRequestItem {
  id: string;
  referenceNumber: string;
  patientName: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: string;
  requiredDate: string;
  hospitalName: string;
  contactPerson: string;
  contactPhone: string;
  status: string;
  publicVisible: boolean;
  createdAt: string;
}

export default function AdminBloodRequestsPage() {
  const [requests, setRequests] = useState<BloodRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/blood-requests");
      const data = await res.json();
      if (data.success) {
        setRequests(data.data.requests);
      }
    } catch (err) {
      console.error("Failed to load blood requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/blood-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Urgent Blood Requirements Moderation
          </h2>
          <p className="text-sm text-slate-500">
            Monitor, verify, and fulfill emergency patient requirements submitted across hospitals.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={fetchRequests} className="gap-1.5 border-slate-300">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <Card className="p-12 text-center text-slate-500 border-slate-200">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
            Loading blood requests...
          </Card>
        ) : requests.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 border-slate-200">
            No blood requests currently recorded.
          </Card>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
              <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <BloodGroupBadge group={req.bloodGroup} size="lg" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-slate-900">{req.patientName}</span>
                      <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {req.referenceNumber}
                      </span>
                      <StatusBadge status={req.urgency} type="urgency" />
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        req.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Hospital className="w-3.5 h-3.5 text-slate-400" />
                        {req.hospitalName}
                      </span>
                      <span>•</span>
                      <span>Required Units: <strong className="text-slate-900">{req.unitsRequired} unit(s)</strong></span>
                      <span>•</span>
                      <span>Date Needed: <strong className="text-slate-900">{formatDate(req.requiredDate)}</strong></span>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact: {req.contactPerson} ({req.contactPhone})</span>
                    </div>
                  </div>
                </div>

                {/* Status Moderation Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === "ACTIVE" ? (
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs h-8"
                      onClick={() => updateStatus(req.id, "FULFILLED")}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Mark Fulfilled
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => updateStatus(req.id, "ACTIVE")}
                    >
                      Re-activate
                    </Button>
                  )}

                  {req.status !== "CANCELLED" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => updateStatus(req.id, "CANCELLED")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
