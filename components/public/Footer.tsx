import React from "react";
import { Droplet, Heart, Phone, Mail, MapPin, Shield, CheckCircle } from "lucide-react";

export function Footer() {
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const districts = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
    "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
    "Wayanad", "Kannur", "Kasaragod"
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Upper Footer: Stats & Trust Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Privacy Protected</h4>
              <p className="text-xs text-slate-400">Strict consent controls and secure contact requests.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center shrink-0">
              <Droplet className="w-6 h-6 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">100% Voluntary</h4>
              <p className="text-xs text-slate-400">Altruistic non-commercial blood donation network.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Verified Donors</h4>
              <p className="text-xs text-slate-400">Manual review and verification by community moderators.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shadow-md shadow-red-600/30">
                <Droplet className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-black text-white">
                Blood<span className="text-red-500">Life</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Every drop can save a life. A modern, transparent, privacy-first community platform connecting voluntary donors with patients across Kerala.
            </p>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400" />
                <span>24/7 Helpline: +91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400" />
                <span>support@bloodlife.org</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>State Blood Transfusion Council, Kerala</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/donors" className="hover:text-red-400 transition-colors">Find a Donor</a></li>
              <li><a href="/become-a-donor" className="hover:text-red-400 transition-colors">Become a Donor</a></li>
              <li><a href="/blood-requests" className="hover:text-red-400 transition-colors">Urgent Blood Requests</a></li>
              <li><a href="/events" className="hover:text-red-400 transition-colors">Donation Camps</a></li>
              <li><a href="/eligibility" className="hover:text-red-400 transition-colors">Eligibility Calculator</a></li>
              <li><a href="/about" className="hover:text-red-400 transition-colors">About Us</a></li>
            </ul>
          </div>

          {/* Blood Groups */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Blood Groups</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {bloodGroups.map((bg) => (
                <a
                  key={bg}
                  href={`/donors?bloodGroup=${encodeURIComponent(bg)}`}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-red-950/60 hover:text-red-400 border border-slate-800 text-center font-mono font-bold transition-colors"
                >
                  {bg}
                </a>
              ))}
            </div>
          </div>

          {/* Legal & Governance */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Legal & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/privacy-policy" className="hover:text-red-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-red-400 transition-colors">Terms of Service</a></li>
              <li><a href="/faq" className="hover:text-red-400 transition-colors">FAQ & Guidelines</a></li>
              <li><a href="/admin/login" className="hover:text-red-400 transition-colors">Staff / Admin Login</a></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 text-xs text-slate-500 space-y-3">
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-400">Medical Disclaimer:</span> This portal serves as an informational coordination service. Automated eligibility indicators are mathematical estimates based on recorded dates and do NOT substitute for mandatory on-site clinical screening, hemoglobin testing, and medical clearance by licensed blood bank personnel.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            <p>&copy; {new Date().getFullYear()} BloodLife Network. All rights reserved.</p>
            <p className="flex items-center gap-1 text-slate-400">
              Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for community healthcare
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
