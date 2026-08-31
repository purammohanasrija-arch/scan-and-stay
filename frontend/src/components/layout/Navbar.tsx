import React, { useState } from 'react';
import {
  QrCode, Building2, MapPin, CalendarCheck, Shield, User as UserIcon,
  Bell, LogOut, Sparkles, Menu, X, Hotel, Compass, Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenNotifications: () => void;
  unreadNotifsCount: number;
  currentPage: string;
  onNavigate: (page: string, data?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenNotifications,
  unreadNotifsCount,
  currentPage,
  onNavigate,
}) => {
  const { user, logout, loginAsDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleNav = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <QrCode className="w-5 h-5 text-teal-400 group-hover:rotate-6 transition-transform" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-teal-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Scan & Stay
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Smart QR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Secure Contactless Hotel Platform</p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'home'
                  ? 'bg-slate-800/80 text-teal-400 border border-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('hotels')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'hotels'
                  ? 'bg-slate-800/80 text-teal-400 border border-teal-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              Explore Hotels
            </button>
            
            {user && (
              <button
                onClick={() => handleNav('dashboard')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentPage === 'dashboard'
                    ? 'bg-slate-800/80 text-teal-400 border border-teal-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-teal-400" />
                My Stays & QR Passes
              </button>
            )}

            {user && (user.role === 'admin' || user.role === 'receptionist') && (
              <button
                onClick={() => handleNav('admin')}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  currentPage === 'admin'
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/20'
                    : 'text-purple-300 hover:bg-purple-950/50 hover:text-purple-200 border border-purple-500/20'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                {user.role === 'admin' ? 'Admin Portal' : 'Reception Scanner'}
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-2.5">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/60 transition-colors"
                title="Quick Demo Accounts"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Accounts</span>
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setDemoMenuOpen(false)}
                >
                  <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                    1-Click Fast Login
                  </p>
                  <button
                    onClick={async () => {
                      await loginAsDemo('guest');
                      setDemoMenuOpen(false);
                      handleNav('dashboard');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>👤 Rahul (Guest)</span>
                    <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded">Active Pass</span>
                  </button>
                  <button
                    onClick={async () => {
                      await loginAsDemo('receptionist');
                      setDemoMenuOpen(false);
                      handleNav('admin');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>💼 Pooja (Reception Desk)</span>
                    <span className="text-[10px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">Scanner</span>
                  </button>
                  <button
                    onClick={async () => {
                      await loginAsDemo('admin');
                      setDemoMenuOpen(false);
                      handleNav('admin');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-slate-800 text-slate-200 flex items-center justify-between"
                  >
                    <span>🛡️ Vikram (Hotel Admin)</span>
                    <span className="text-[10px] text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">Full RBAC</span>
                  </button>
                </div>
              )}
            </div>

            {/* Notification Bell */}
            {user && (
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notifications (Email & WhatsApp Alerts)"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-slate-950">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>
            )}

            {/* User Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => handleNav('dashboard')}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-slate-800 ring-1 ring-teal-500/40"
                  />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs font-semibold text-slate-200 leading-tight">
                      {user.name.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-teal-400 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      {user.loyalty_points} pts
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:from-teal-400 hover:to-emerald-400 shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-2">
          <button
            onClick={() => handleNav('home')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            Home
          </button>
          <button
            onClick={() => handleNav('hotels')}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-900"
          >
            Explore Hotels
          </button>
          {user && (
            <button
              onClick={() => handleNav('dashboard')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-teal-400 hover:bg-slate-900 flex items-center gap-2"
            >
              <CalendarCheck className="w-4 h-4" />
              My Stays & QR Passes
            </button>
          )}
          {user && (user.role === 'admin' || user.role === 'receptionist') && (
            <button
              onClick={() => handleNav('admin')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-purple-400 hover:bg-slate-900 flex items-center gap-2"
            >
              <Shield className="w-4 h-4" />
              Admin / Reception Station
            </button>
          )}

          <div className="pt-3 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-slate-500 uppercase px-3 mb-2">Switch Demo Role</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={async () => {
                  await loginAsDemo('guest');
                  setMobileMenuOpen(false);
                  handleNav('dashboard');
                }}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-center font-medium text-slate-300"
              >
                Guest
              </button>
              <button
                onClick={async () => {
                  await loginAsDemo('receptionist');
                  setMobileMenuOpen(false);
                  handleNav('admin');
                }}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-center font-medium text-slate-300"
              >
                Reception
              </button>
              <button
                onClick={async () => {
                  await loginAsDemo('admin');
                  setMobileMenuOpen(false);
                  handleNav('admin');
                }}
                className="px-2 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-center font-medium text-slate-300"
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
