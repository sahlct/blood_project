import React from "react";
import { getSessionUser } from "@/lib/auth/session";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export const dynamic = "force-dynamic";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Header user={user} />
      <main className="flex-1 bg-slate-50">{children}</main>
      <Footer />
    </div>
  );
}
