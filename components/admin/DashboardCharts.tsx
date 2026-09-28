"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DashboardChartsProps {
  donorsByBloodGroup: { name: string; count: number }[];
  donorsByDistrict: { name: string; count: number }[];
  monthlyStats: { month: string; donations: number; newDonors: number }[];
}

const BLOOD_COLORS = [
  "#ef4444", // A+ (Red)
  "#f87171", // A- (Light red)
  "#f97316", // B+ (Orange)
  "#fb923c", // B- (Light orange)
  "#8b5cf6", // AB+ (Purple)
  "#a78bfa", // AB- (Light purple)
  "#0ea5e9", // O+ (Sky blue)
  "#38bdf8", // O- (Light sky blue)
];

export function DashboardCharts({
  donorsByBloodGroup,
  donorsByDistrict,
  monthlyStats,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Donors by Blood Group */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-800">
            Donors by Blood Group
          </CardTitle>
          <p className="text-xs text-slate-500">Distribution of registered verified donors across ABO/Rh groups</p>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donorsByBloodGroup} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#dc2626" radius={[6, 6, 0, 0]}>
                  {donorsByBloodGroup.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BLOOD_COLORS[index % BLOOD_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Monthly Donation Activity */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-800">
            Monthly Donation & Registration Trend
          </CardTitle>
          <p className="text-xs text-slate-500">Completed donation units vs. new voluntary donor signups</p>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line
                  type="monotone"
                  dataKey="donations"
                  name="Completed Donations"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#dc2626" }}
                />
                <Line
                  type="monotone"
                  dataKey="newDonors"
                  name="New Donors"
                  stroke="#0d9488"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#0d9488" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Chart 3: Donors by District */}
      <Card className="lg:col-span-2 shadow-xs border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-slate-800">
            Regional Donor Density by District (Kerala)
          </CardTitle>
          <p className="text-xs text-slate-500">Active donor network across Kerala districts</p>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donorsByDistrict} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Donors" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
