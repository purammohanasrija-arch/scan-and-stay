import React from 'react';
import { QrCode, Shield, Zap, Lock, MapPin, Heart, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                <QrCode className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Scan & Stay</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The next-generation smart hotel reservation system powered by cryptographic QR authentication, digital IoT room access, and responsive architecture.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full border border-teal-500/20 w-fit">
              <Lock className="w-3 h-3" />
              <span>HMAC-SHA256 Signed Passes</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Explore Destinations</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="hover:text-teal-400 cursor-pointer">Goa Beachfront Resorts</li>
              <li className="hover:text-teal-400 cursor-pointer">Jaipur Royal Havelis</li>
              <li className="hover:text-teal-400 cursor-pointer">Bengaluru Tech Suites</li>
              <li className="hover:text-teal-400 cursor-pointer">Manali Snow Chalets</li>
              <li className="hover:text-teal-400 cursor-pointer">Udaipur Lakeside Villas</li>
            </ul>
          </div>

          {/* System Capabilities */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Core Technology</h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>5-Sec Contactless Check-in</span>
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Encrypted IoT Digital Keys</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                <span>AI Fraud & Velocity Protection</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>StayBot AI Concierge</span>
              </li>
            </ul>
          </div>

          {/* Security & Badges */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Security & Trust</h4>
            <div className="glass-card rounded-xl p-3.5 space-y-2 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Enterprise Verified Platform</span>
              </div>
              <p className="text-[11px] text-slate-400">
                All reservations are protected with end-to-end encryption, automated tamper verification, and zero duplicate pass guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Scan & Stay System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Security Protocol</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">API Docs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
