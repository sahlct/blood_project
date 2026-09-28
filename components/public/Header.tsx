"use client";

import React, { useState } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { Droplet, Menu, X, Heart, Search, Calendar, AlertCircle, User, Shield, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user?: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  } | null;
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/donors", label: "Find Donors", icon: Search },
    { href: "/blood-requests", label: "Urgent Requests", icon: AlertCircle, highlight: true },
    { href: "/events", label: "Donation Camps", icon: Calendar },
    { href: "/blood-groups", label: "Blood Groups" },
    { href: "/districts", label: "Districts" },
    { href: "/eligibility", label: "Eligibility Calculator" },
    { href: "/about", label: "About" },
  ];

  const isAdmin = user?.roles.some((r) => ["SUPER_ADMIN", "ADMIN", "MODERATOR", "STAFF"].includes(r));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs transition-all">
      {/* Emergency Top Banner */}
      <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white text-xs py-2 px-4 font-medium flex flex-wrap items-center justify-center gap-2 sm:gap-4 shadow-inner">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          24/7 Kerala Helpline
        </span>
        <span className="font-semibold text-rose-50">Urgent Blood Needed for a Patient?</span>
        <a
          href="/blood-requests/new"
          className="inline-flex items-center gap-1 bg-white text-red-700 px-2.5 py-0.5 rounded-md font-black text-xs hover:bg-rose-50 transition-colors shadow-xs"
        >
          Post Urgent Request &rarr;
        </a>
        <span className="hidden md:inline text-rose-200">| Direct Support: +91 98765 43210</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30 group-hover:scale-105 group-hover:shadow-red-600/50 transition-all">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-red-600 transition-colors">
                  Blood<span className="text-red-600">Life</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-red-600 border border-rose-200/80">
                  Kerala
                </span>
              </div>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Voluntary Blood Donor Network
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "text-red-600 bg-red-50/80 font-bold shadow-xs"
                      : link.highlight
                      ? "text-red-600 hover:bg-rose-50 font-bold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.highlight && <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />}
                    {link.label}
                  </span>
                </a>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <a href="/become-a-donor">
              <Button
                variant="medical"
                size="sm"
                className="gap-2 font-black shadow-md shadow-red-600/25 hover:shadow-lg hover:shadow-red-600/40 hover:scale-[1.02] transition-all px-4 py-2"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Become a Donor</span>
              </Button>
            </a>

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {isAdmin && (
                  <a href="/admin">
                    <Button variant="outline" size="sm" className="gap-1.5 border-slate-300 font-bold">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                      <span>Admin</span>
                    </Button>
                  </a>
                )}
                <a href="/dashboard">
                  <Button variant="secondary" size="sm" className="gap-1.5 font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-slate-700" />
                    <span>{user.name.split(" ")[0]}</span>
                  </Button>
                </a>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    title="Logout"
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <a href="/login">
                  <Button variant="ghost" size="sm" className="font-bold text-slate-700 hover:text-red-600">
                    Sign In
                  </Button>
                </a>
                <a href="/register">
                  <Button variant="outline" size="sm" className="font-bold border-slate-300 text-slate-800 hover:bg-slate-50">
                    Register
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <a href="/become-a-donor">
              <Button variant="medical" size="sm" className="text-xs px-2.5 h-8">
                Donate
              </Button>
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-rose-100 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
              >
                {link.icon && <link.icon className="w-4 h-4 text-red-500" />}
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <a href="/become-a-donor" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="medical" className="w-full justify-center">
                Become a Blood Donor
              </Button>
            </a>
            <a href="/blood-requests/new" className="block w-full" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center text-red-600 border-red-200">
                Post Urgent Blood Request
              </Button>
            </a>
            {user ? (
              <div className="pt-2 flex flex-col gap-2">
                <a href="/dashboard" className="block" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">
                    My Donor Dashboard
                  </Button>
                </a>
                {isAdmin && (
                  <a href="/admin" className="block" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Admin Portal
                    </Button>
                  </a>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <a href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </a>
                <a href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full justify-center">
                    Register
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
