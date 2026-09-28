import React from "react";
import prisma from "@/lib/prisma";
import { HelpCircle, ChevronRight, Droplet, Heart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const faqs = await prisma.faqItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600">
          Everything you need to know about voluntary blood donation, safety, eligibility intervals, and directory privacy.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <Card key={faq.id} className="border-slate-200 shadow-xs">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-red-600 fill-red-600 shrink-0" />
                  <span>{faq.question}</span>
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {faq.category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                {faq.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-2xl p-6 bg-red-50 border border-red-100 text-center space-y-3">
        <h3 className="font-bold text-slate-900">Still have questions?</h3>
        <p className="text-xs text-slate-600">Reach our 24/7 coordination team anytime for hospital blood assistance.</p>
        <a href="/contact">
          <Button variant="medical" size="sm">
            Contact Helpline &rarr;
          </Button>
        </a>
      </div>
    </div>
  );
}
