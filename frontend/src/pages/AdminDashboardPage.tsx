import React, { useState, useEffect } from 'react';
import {
  Shield, QrCode, Building2, Users, CreditCard, Sparkles,
  TrendingUp, AlertTriangle, CheckCircle2, XCircle, Search,
  RefreshCw, Camera, Key, Lock, ArrowUpRight, Bed, Eye
} from 'lucide-react';
import { AdminAnalytics, Booking, AuditLog, Hotel, Room } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'scanner' | 'bookings' | 'hotels' | 'security' | 'ai_pricing'>('overview');

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [pricingInsights, setPricingInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Scanner Station state
  const [scanInput, setScanInput] = useState('');
  const [scanAction, setScanAction] = useState<'check_in' | 'check_out' | 'info'>('check_in');
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    message: string;
    booking?: Booking;
  } | null>(null);
  const [scanning, setScanning] = useState(false);

  // Booking search filter
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [anData, bkData, lgData, htData, prData] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAllBookings(),
        api.getAuditLogs(),
        api.getHotels(),
        api.getDynamicPricing(),
      ]);

      setAnalytics(anData);
      setBookings(bkData);
      setAuditLogs(lgData);
      setHotels(htData);
      setPricingInsights(prData);
    } catch (e) {
      console.error('Failed to load admin data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateQR = async (tokenOverride?: string) => {
    const token = tokenOverride || scanInput;
    if (!token.trim()) return;

    setScanning(true);
    setScanResult(null);

    try {
      const res = await api.validateQR(token.trim(), scanAction, `${user?.name || 'Reception Staff'} (Desk 1)`);
      setScanResult(res);
      // Reload bookings to reflect updated status
      const updatedBookings = await api.getAllBookings();
      setBookings(updatedBookings);
      const updatedLogs = await api.getAuditLogs();
      setAuditLogs(updatedLogs);
    } catch (err: any) {
      setScanResult({
        valid: false,
        message: err.message || 'Verification failed. Cryptographic signature invalid.',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await api.updateBookingStatus(bookingId, { booking_status: status });
      const updated = await api.getAllBookings();
      setBookings(updated);
      const anData = await api.getAdminAnalytics();
      setAnalytics(anData);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Admin & Reception Command Center
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {user?.role.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time reservation monitoring, cryptographic QR kiosk check-in, and smart dynamic pricing.
            </p>
          </div>
        </div>

        <button
          onClick={loadAllAdminData}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-teal-400" />
          <span>Sync Live Data</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'overview', label: '📊 Dashboard Overview' },
          { id: 'scanner', label: '📷 Live QR Check-in Station' },
          { id: 'bookings', label: '📑 Reservations Ledger' },
          { id: 'hotels', label: '🏨 Hotels & Room Inventory' },
          { id: 'security', label: '🛡️ Fraud & Security Logs' },
          { id: 'ai_pricing', label: '🤖 AI Dynamic Pricing' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-8">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <div className="text-2xl sm:text-3xl font-black text-white">
                ₹{analytics.total_revenue.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                +24.8% this month
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bookings</span>
              <div className="text-2xl sm:text-3xl font-black text-teal-400">
                {analytics.total_bookings}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Verified Reservations</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Occupancy Rate</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                {analytics.occupancy_rate}%
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {analytics.available_rooms} Available / {analytics.total_rooms} Rooms
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Checked-In</span>
              <div className="text-2xl sm:text-3xl font-black text-purple-400">
                {analytics.active_guests} Guests
              </div>
              <span className="text-[11px] text-emerald-400 font-medium">Currently in-house</span>
            </div>
          </div>

          {/* Monthly Revenue Chart Bars */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Monthly Revenue & Volume Trend</h3>
                <p className="text-xs text-slate-400">Financial performance across all properties</p>
              </div>
              <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                Healthy Growth
              </span>
            </div>

            <div className="h-44 flex items-end gap-3 sm:gap-6 pt-6 px-2">
              {analytics.monthly_revenue.map((item, idx) => {
                const heightPercent = Math.min(100, Math.max(25, (item.revenue / 600000) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{(item.revenue / 1000).toFixed(0)}k
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full rounded-2xl bg-gradient-to-t from-teal-600 to-emerald-400 group-hover:from-teal-500 group-hover:to-emerald-300 transition-all shadow-lg shadow-teal-500/10"
                    />
                    <span className="text-xs font-bold text-slate-400">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. LIVE QR CHECK-IN SCANNER TAB */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Front Desk QR Scan Station</h3>
                    <p className="text-xs text-slate-400">Validate cryptographic guest tokens instantly</p>
                  </div>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setScanAction('check_in')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      scanAction === 'check_in' ? 'bg-teal-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Check-In
                  </button>
                  <button
                    onClick={() => setScanAction('check_out')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      scanAction === 'check_out' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                    }`}
                  >
                    Check-Out
                  </button>
                  <button
                    onClick={() => setScanAction('info')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      scanAction === 'info' ? 'bg-purple-500 text-white' : 'text-slate-400'
                    }`}
                  >
                    Verify Info
                  </button>
                </div>
              </div>

              {/* Input / Scanner simulation */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Scan Barcode or Paste Signed Token:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Scan camera or paste base64 QR payload token here..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={() => handleValidateQR()}
                    disabled={scanning || !scanInput.trim()}
                    className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-xl shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{scanning ? 'Verifying...' : 'Validate & Execute'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Scan Active Guest Pass Preset */}
              {bookings.length > 0 && bookings[0].qr_pass && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-teal-400 font-bold uppercase block">Demo Test Shortcut</span>
                    <span className="text-xs text-slate-300">
                      Auto-fill Active Pass for {bookings[0].guest_name} ({bookings[0].booking_ref})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setScanInput(bookings[0].qr_pass!.qr_token);
                      handleValidateQR(bookings[0].qr_pass!.qr_token);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    1-Click Auto Scan
                  </button>
                </div>
              )}

              {/* Scan Result Feedback Box */}
              {scanResult && (
                <div
                  className={`p-6 rounded-3xl border space-y-3 transition-all ${
                    scanResult.valid
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {scanResult.valid ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {scanResult.valid ? 'VALIDATION PASSED' : 'SECURITY ALERT - INVALID TOKEN'}
                      </h4>
                      <p className="text-xs leading-relaxed">{scanResult.message}</p>
                    </div>
                  </div>

                  {scanResult.booking && (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-3 gap-3 text-xs text-white">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Guest</span>
                        <span className="font-bold">{scanResult.booking.guest_name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Room</span>
                        <span className="font-bold text-teal-400">
                          Room {scanResult.booking.room?.room_number} ({scanResult.booking.room?.room_type})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Status</span>
                        <span className="font-bold text-emerald-400 uppercase">
                          {scanResult.booking.booking_status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-3 text-xs text-slate-400">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs">QR Scanner Protocol</h4>
              <p>1. Camera Scanner detects HMAC-SHA256 signature.</p>
              <p>2. Nonce anti-replay timestamp verification.</p>
              <p>3. Room occupancy status automatically toggles to <em>Occupied</em>.</p>
              <p>4. IoT Smart Keycard is activated for guest's smartphone.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESERVATIONS LEDGER TAB */}
      {activeTab === 'bookings' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">All Active & Past Reservations</h3>
              <p className="text-xs text-slate-400">{bookings.length} reservations found</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search guest or ref..."
                  className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="checked_in">Checked In</option>
                <option value="checked_out">Checked Out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Guest</th>
                  <th className="p-3">Property & Room</th>
                  <th className="p-3">Dates</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {bookings
                  .filter((b) => {
                    const matchSearch =
                      b.guest_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                      b.booking_ref.toLowerCase().includes(bookingSearch.toLowerCase()) ||
                      (b.hotel?.name || '').toLowerCase().includes(bookingSearch.toLowerCase());
                    const matchStatus = bookingFilterStatus === 'all' || b.booking_status === bookingFilterStatus;
                    return matchSearch && matchStatus;
                  })
                  .map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-mono font-bold text-teal-400">{b.booking_ref}</td>
                      <td className="p-3 font-medium text-white">{b.guest_name}</td>
                      <td className="p-3">
                        <span className="font-semibold text-white block">{b.hotel?.name}</span>
                        <span className="text-[11px] text-teal-400">Room {b.room?.room_number} ({b.room?.room_type})</span>
                      </td>
                      <td className="p-3 text-slate-400">
                        {b.check_in_date} → {b.check_out_date}
                      </td>
                      <td className="p-3 font-bold text-white">₹{b.total_amount.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          b.booking_status === 'checked_in'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : b.booking_status === 'confirmed'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : b.booking_status === 'checked_out'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {b.booking_status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {b.booking_status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'checked_in')}
                            className="px-2.5 py-1 rounded-lg bg-teal-500 text-slate-950 font-bold text-[11px] hover:bg-teal-400"
                          >
                            Check In
                          </button>
                        )}
                        {b.booking_status === 'checked_in' && (
                          <button
                            onClick={() => handleUpdateBookingStatus(b.id, 'checked_out')}
                            className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400"
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. HOTELS & ROOMS TAB */}
      {activeTab === 'hotels' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-5 space-y-4 shadow-xl"
              >
                <img
                  src={hotel.cover_image}
                  alt={hotel.name}
                  className="w-full h-40 object-cover rounded-2xl bg-slate-950"
                />
                <div>
                  <h4 className="text-base font-bold text-white">{hotel.name}</h4>
                  <p className="text-xs text-slate-400">{hotel.city}, {hotel.state}</p>
                </div>
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Base Price: <strong className="text-white">₹{hotel.base_price}</strong></span>
                  <span className="text-amber-400 font-bold">★ {hotel.rating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SECURITY & AUDIT LOGS TAB */}
      {activeTab === 'security' && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div>
            <h3 className="text-base font-bold text-white">Cryptographic Audit & Access Trail</h3>
            <p className="text-xs text-slate-400">Real-time tamper detection, QR scan events, and biometric IoT unlocks</p>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-4 ${
                  log.is_suspicious
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-teal-400">{log.action}</span>
                    {log.is_suspicious && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-slate-950">
                        FLAGGED
                      </span>
                    )}
                    <span className="text-slate-400 text-[11px]">{log.user_email || 'System Agent'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{log.details}</p>
                </div>

                <div className="text-right text-[10px] text-slate-500 shrink-0 font-mono">
                  <div>{new Date(log.timestamp).toLocaleTimeString()}</div>
                  <div>IP: {log.ip_address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. AI DYNAMIC PRICING TAB */}
      {activeTab === 'ai_pricing' && pricingInsights && (
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Dynamic Pricing & Yield Advisor</h3>
              <p className="text-xs text-slate-400">Predictive demand models forecasting occupancy and seasonal surges</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingInsights.insights.map((item: any) => (
              <div
                key={item.hotel_id}
                className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{item.hotel_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300">
                    {item.confidence_score} Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Current Base</span>
                    <span className="font-bold text-slate-300">₹{item.current_base_price}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-teal-400 block">AI Recommended</span>
                    <span className="font-bold text-teal-300">₹{item.suggested_base_price}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.ai_rationale}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
