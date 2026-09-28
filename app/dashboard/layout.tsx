import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header user={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
