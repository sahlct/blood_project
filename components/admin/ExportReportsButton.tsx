"use client";

import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportReportsButtonProps {
  donorsByBloodGroup: { name: string; count: number }[];
  donorsByDistrict: { name: string; count: number }[];
  summary: {
    totalDonations: number;
    fulfilledRequests: number;
    activeRequests: number;
  };
}

export function ExportReportsButton({
  donorsByBloodGroup,
  donorsByDistrict,
  summary,
}: ExportReportsButtonProps) {
  const handleExport = () => {
    let csv = "Category,Metric,Count\n";
    csv += `Summary,Total Blood Units Donated,${summary.totalDonations}\n`;
    csv += `Summary,Emergency Requests Fulfilled,${summary.fulfilledRequests}\n`;
    csv += `Summary,Active Critical Requirements,${summary.activeRequests}\n`;

    donorsByBloodGroup.forEach((bg) => {
      csv += `Blood Group,${bg.name},${bg.count}\n`;
    });

    donorsByDistrict.forEach((d) => {
      csv += `District,${d.name},${d.count}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `bloodlife_analytical_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
      onClick={handleExport}
    >
      <Download className="w-4 h-4 text-red-600" />
      <span>Export Summary (CSV)</span>
    </Button>
  );
}
