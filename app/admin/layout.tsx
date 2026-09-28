import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { hasAnyPermission } from "@/lib/rbac/permissions";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  const isAdminOrStaff =
    session.roles.some((r) => ["SUPER_ADMIN", "ADMIN", "MODERATOR", "STAFF"].includes(r)) ||
    hasAnyPermission(session, ["donors.view", "users.view", "donations.view"]);

  if (!isAdminOrStaff) {
    redirect("/dashboard?error=unauthorized_admin");
  }

  // Get dynamic counts for sidebar badges
  const [pendingDonors, activeRequests] = await Promise.all([
    prisma.donorProfile.count({
      where: { verificationStatus: "PENDING", deletedAt: null },
    }),
    prisma.bloodRequest.count({
      where: { status: "ACTIVE" },
    }),
  ]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
      <AdminSidebar
        userRole={session.roles[0] || "ADMIN"}
        counts={{ pendingDonors, activeRequests }}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AdminHeader user={session} />
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <main className="p-6 sm:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
