"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Droplet, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Invalid credentials");
      }

      const user = data.data.user;
      const isAdmin = user.roles.some((r: string) =>
        ["SUPER_ADMIN", "ADMIN", "MODERATOR", "STAFF"].includes(r)
      );

      if (callbackUrl) {
        router.push(callbackUrl);
      } else if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center mx-auto shadow-md shadow-red-500/25">
            <Droplet className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to Blood<span className="text-red-600">Life</span>
          </h1>
          <p className="text-xs text-slate-500">
            Access your donor dashboard, update availability, or manage operations
          </p>
        </div>

        {/* Demo Credentials Helper Box */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 text-xs space-y-2 shadow-sm border border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-red-400" />
            <span>Seed Credentials</span>
          </div>
          <div className="space-y-1 text-[11px] font-mono text-slate-300">
            <div>
              <span className="text-red-400 font-semibold">Super Admin:</span> admin@bloodlife.org / SuperAdmin123!Secure
            </div>
            <div>
              <span className="text-emerald-400 font-semibold">Sample Donor:</span> rahul.donor@example.com / Donor123!Secure
            </div>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="medical"
                size="lg"
                disabled={loading}
                className="w-full font-bold justify-center mt-2 shadow-md shadow-red-500/20"
              >
                <span>{loading ? "Signing In..." : "Sign In &rarr;"}</span>
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
              <p>
                Don&apos;t have an account yet?{" "}
                <a href="/register" className="text-red-600 font-bold hover:underline">
                  Create Member Account
                </a>
              </p>
              <p>
                Want to register as a donor directly?{" "}
                <a href="/become-a-donor" className="text-red-600 font-bold hover:underline">
                  Register as Blood Donor
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-slate-500">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
