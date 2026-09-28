import React from "react";
import prisma from "@/lib/prisma";
import { Users, Shield, CheckCircle2, Clock, Mail, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      userRoles: { include: { role: true } },
      donorProfile: {
        include: { bloodGroup: true, district: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            User Accounts & Security Roles
          </h2>
          <p className="text-sm text-slate-500">
            Administrative overview of registered users, staff assignments, and donor profiles.
          </p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Assigned Roles</th>
                <th className="py-3 px-4">Donor Profile</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Login</th>
                <th className="py-3 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {u.email}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {u.userRoles.length === 0 ? (
                        <span className="text-xs text-slate-400">Standard Member</span>
                      ) : (
                        u.userRoles.map((ur) => (
                          <span
                            key={ur.id}
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              ur.role.name === "SUPER_ADMIN"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : ur.role.name === "ADMIN"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {ur.role.displayName}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {u.donorProfile ? (
                      <span className="text-xs text-slate-700 font-medium">
                        {u.donorProfile.bloodGroup.group} ({u.donorProfile.district.name})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Not Registered</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {formatDate(u.createdAt)}
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
