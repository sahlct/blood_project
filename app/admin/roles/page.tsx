import React from "react";
import prisma from "@/lib/prisma";
import { Shield, KeyRound, Check, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.permission.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  // Group permissions by category
  const categories = Array.from(new Set(permissions.map((p) => p.category)));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Role-Based Access Control (RBAC) Matrix
        </h2>
        <p className="text-sm text-slate-500">
          Database-driven security permissions mapped across administrative, moderator, and staff roles.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400">
                  {role.name}
                </span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {role._count.userRoles} users
                </span>
              </div>
              <CardTitle className="text-base font-bold text-slate-900 mt-1">
                {role.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500 min-h-[32px] leading-relaxed">
                {role.description || "System operational role"}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] font-semibold text-rose-600">
                {role.rolePermissions.length} Privileges Granted
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-slate-100 pb-3">
          <CardTitle className="text-base font-bold text-slate-900">
            System Permission Matrix
          </CardTitle>
          <p className="text-xs text-slate-500">
            Authoritative database permission rules evaluated by server-side guards
          </p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Permission Name & Key</th>
                <th className="py-3 px-4">Category</th>
                {roles.map((r) => (
                  <th key={r.id} className="py-3 px-4 text-center">
                    {r.displayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((perm) => (
                <tr key={perm.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4">
                    <div className="font-semibold text-slate-900 text-xs">{perm.displayName}</div>
                    <div className="text-[11px] font-mono text-slate-400">{perm.name}</div>
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {perm.category}
                    </span>
                  </td>
                  {roles.map((role) => {
                    const hasPerm =
                      role.name === "SUPER_ADMIN" ||
                      role.rolePermissions.some((rp) => rp.permissionId === perm.id);
                    return (
                      <td key={role.id} className="py-2.5 px-4 text-center">
                        {hasPerm ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
