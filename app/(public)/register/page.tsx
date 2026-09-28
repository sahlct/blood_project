"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplet, Lock, Mail, User, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, confirmPassword }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to register");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center mx-auto shadow-md shadow-red-500/25">
            <Droplet className="w-6 h-6 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Member Account
          </h1>
          <p className="text-xs text-slate-500">
            Join the community to support blood donation drives and coordinate emergency requests
          </p>
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
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    required
                    placeholder="e.g. Maya Krishnan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    type="email"
                    required
                    placeholder="maya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    type="tel"
                    required
                    placeholder="+91 98460 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Password (min 8 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <Input
                    type="password"
                    required
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>{loading ? "Creating Account..." : "Register Account &rarr;"}</span>
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600 space-y-2">
              <p>
                Already have an account?{" "}
                <a href="/login" className="text-red-600 font-bold hover:underline">
                  Sign In
                </a>
              </p>
              <p>
                Ready to donate blood?{" "}
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
