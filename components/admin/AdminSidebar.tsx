"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Heart,
  Droplet,
  Calendar,
  AlertCircle,
  Shield,
  KeyRound,
  FileText,
  History,
  Settings,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  userRole?: string;
  counts?: {
    pendingDonors?: number;
    activeRequests?: number;
  };
}

export function AdminSidebar({ userRole = "ADMIN", counts }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/admin/donors",
      label: "Donors",
      icon: Users,
      badge: counts?.pendingDonors ? `${counts.pendingDonors} pending` : undefined,
      badgeColor: "bg-amber-100 text-amber-800",
    },
    { href: "/admin/donations", label: "Donation Records", icon: Heart },
    {
      href: "/admin/blood-requests",
      label: "Urgent Requests",
      icon: AlertCircle,
      badge: counts?.activeRequests ? `${counts.activeRequests} active` : undefined,
      badgeColor: "bg-red-100 text-red-800",
    },
    { href: "/admin/events", label: "Donation Camps", icon: Calendar },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/roles", label: "Roles & RBAC", icon: Shield },
    { href: "/admin/reports", label: "Reports & Analytics", icon: FileText },
    { href: "/admin/audit-logs", label: "Audit Logs", icon: History },
    { href: "/admin/settings", label: "System Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 h-full select-none">
      {/* Brand Header */}
      <div className="h-16 shrink-0 flex items-center gap-3 px-5 border-b border-slate-800 bg-slate-950/60">
        <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30">
          <Droplet className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <span className="font-bold text-white tracking-tight">BloodLife</span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-rose-400">
            Admin Console
          </span>
        </div>
      </div>

      {/* Navigation Links with independent hidden scrollbar */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto no-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Operations
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-red-600 text-white font-semibold shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-red-400"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    isActive ? "bg-white/20 text-white" : item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </div>

      {/* Footer: View Public Portal */}
      <div className="p-3 shrink-0 border-t border-slate-800 bg-slate-950/40">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            Public Web Portal
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
}
