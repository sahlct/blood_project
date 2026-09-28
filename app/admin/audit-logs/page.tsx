import React from "react";
import prisma from "@/lib/prisma";
import { History, Shield, Clock, User, Globe, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Security & Operational Audit Trail
        </h2>
        <p className="text-sm text-slate-500">
          Immutable audit log tracking all administrative logins, donor approvals, donation entries, and setting updates.
        </p>
      </div>

      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 text-xs font-mono">
                  <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                    {formatDate(log.createdAt)} {new Date(log.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-sans">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-700 whitespace-nowrap font-sans">
                    {log.actorName} <span className="text-slate-400">({log.actorEmail})</span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                    {log.entity} {log.entityId ? `#${log.entityId.slice(0, 6)}...` : ""}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 max-w-xs truncate" title={log.details || ""}>
                    {log.details || "—"}
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">
                    {log.ipAddress || "127.0.0.1"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
