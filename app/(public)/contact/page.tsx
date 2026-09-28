"use client";

import React, { useState } from "react";
import { Phone, Mail, MapPin, Send, CheckCircle2, Heart, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Contact BloodLife Helpline
        </h1>
        <p className="text-sm text-slate-600">
          Have questions regarding donor registration, voluntary blood donation camps, or hospital blood banking? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <Card className="border-slate-200 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">24/7 Emergency Helpline</h3>
            <p className="text-xs text-slate-500">For urgent hospital transfusions & inquiries</p>
            <div className="pt-1 text-sm font-bold text-red-600 font-mono">+91 98765 43210</div>
          </Card>

          <Card className="border-slate-200 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Official Support Email</h3>
            <p className="text-xs text-slate-500">Camp coordination & general inquiries</p>
            <div className="pt-1 text-sm font-bold text-slate-800">support@bloodlife.org</div>
          </Card>

          <Card className="border-slate-200 p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Regional Coordination</h3>
            <p className="text-xs text-slate-500">State Blood Transfusion Council Liaison, Kerala, India</p>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-slate-900">
                Send an Inquiry or Camp Proposal
              </CardTitle>
              <p className="text-xs text-slate-500">
                Our support team typically responds within 1 to 2 business hours.
              </p>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="text-xl font-bold text-slate-900">Message Delivered!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Thank you, {name}. A member of our coordination team will get back to you shortly at {email}.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Your Name
                      </label>
                      <Input
                        required
                        placeholder="e.g. Anand Varma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        required
                        placeholder="anand@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Subject
                    </label>
                    <Input
                      required
                      placeholder="e.g. Organize College Blood Donation Camp in Ernakulam"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Your Message
                    </label>
                    <Textarea
                      required
                      rows={4}
                      placeholder="Share details of your request or inquiry..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="medical" size="lg" className="w-full sm:w-auto font-bold gap-2">
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
