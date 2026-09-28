"use client";

import React from "react";
import { LogOut, Bell, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  const primaryRole = user.roles[0] || "STAFF";

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-slate-800 hidden sm:block">
          BloodLife Central Management
        </h1>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
          Kerala Operations
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Role Badge */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            {primaryRole.replace("_", " ")}
          </span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0)}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-800">{user.name}</div>
            <div className="text-slate-500 text-[11px] truncate max-w-[150px]">{user.email}</div>
          </div>
        </div>

        {/* Logout */}
        <form action="/api/auth/logout" method="POST">
          <Button variant="ghost" size="sm" type="submit" className="text-slate-500 hover:text-red-600 gap-1.5">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
