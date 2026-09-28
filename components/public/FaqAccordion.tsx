"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItemData[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3.5">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.id}
            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
              isOpen
                ? "bg-white border-red-200/90 shadow-md ring-1 ring-red-100"
                : "bg-white/80 border-slate-200/80 hover:border-slate-300 shadow-xs"
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? "bg-red-50 text-red-600 font-bold" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-900">{item.question}</span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180 text-red-600" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
