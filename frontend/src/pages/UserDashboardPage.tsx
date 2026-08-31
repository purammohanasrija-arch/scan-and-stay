import React, { useState, useEffect } from 'react';
import {
  CalendarCheck, QrCode, Key, FileText, XCircle, Sparkles,
  MapPin, Clock, ShieldCheck, Utensils, Heart, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { QRPassModal } from '../components/qr/QRPassModal';
import { DigitalKeySimulator } from '../components/qr/DigitalKeySimulator';
import { InRoomOrderModal } from '../components/qr/InRoomOrderModal';
import { InvoiceViewer } from '../components/invoice/InvoiceViewer';

interface UserDashboardPageProps {
  onExploreHotels: () => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onExploreHotels }) => {
  const { user, refreshProfile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected modals
  const [selectedBookingForQR, setSelectedBookingForQR] = useState<Booking | null>(null);
  const [selectedBookingForKey, setSelectedBookingForKey] = useState<Booking | null>(null);
  const [selectedBookingForDining, setSelectedBookingForDining] = useState<Booking | null>(null);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] = useState<number | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (e) {
      console.error('Failed to load my bookings', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking? A full refund will be processed to your original payment method.')) {
      return;
    }
    try {
      await api.cancelBooking(bookingId);
      await loadBookings();
      if (refreshProfile) await refreshProfile();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  const activeBookings = bookings.filter(
    (b) => b.booking_status === 'confirmed' || b.booking_status === 'checked_in'
  );
  const pastBookings = bookings.filter(
    (b) => b.booking_status === 'checked_out' || b.booking_status === 'cancelled'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-slate-900 border border-teal-500/30 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Guest'}`}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl bg-slate-950 border border-teal-500/40 p-1"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Welcome, {user?.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Verified Guest
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email} • {user?.phone || 'Mobile linked'}</p>
          </div>
        </div>

        {/* Loyalty Wallet Card */}
        <div className="flex items-center gap-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Scan & Stay Wallet</div>
            <div className="text-lg font-black text-amber-400">{user?.loyalty_points || 0} Points</div>
            <div className="text-[10px] text-teal-400">Worth ₹{user?.loyalty_points || 0} on your next stay</div>
          </div>
        </div>
      </div>

      {/* Active Stays Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">Active Stays & Digital Passes</h2>
          </div>
          <button
            onClick={loadBookings}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading active reservations...</div>
        ) : activeBookings.length === 0 ? (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-3">
            <QrCode className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-white">No active reservations at the moment.</p>
            <p className="text-xs text-slate-400">Explore handpicked smart properties and get your instant QR pass!</p>
            <button
              onClick={onExploreHotels}
              className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
            >
              Browse Hotels
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="rounded-3xl bg-slate-900 border border-teal-500/40 p-6 flex flex-col justify-between space-y-5 shadow-2xl shadow-teal-500/5 relative overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Status & Booking Ref */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {b.booking_status === 'checked_in' ? 'CURRENTLY CHECKED IN' : 'CONFIRMED & READY'}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {b.booking_ref}
                    </span>
                  </div>

                  {/* Hotel & Room Title */}
                  <div className="flex items-start gap-4">
                    <img
                      src={b.hotel?.cover_image}
                      alt={b.hotel?.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-white">{b.hotel?.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        <span>{b.hotel?.city}, {b.hotel?.state}</span>
                      </p>
                      <p className="text-xs text-teal-300 font-semibold mt-1">
                        Room {b.room?.room_number} ({b.room?.room_type})
                      </p>
                    </div>
                  </div>

                  {/* Stay Dates */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Check-In</span>
                      <span className="font-bold text-white">{b.check_in_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Check-Out</span>
                      <span className="font-bold text-white">{b.check_out_date}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedBookingForQR(b)}
                      className="py-2.5 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>View QR Pass</span>
                    </button>

                    <button
                      onClick={() => setSelectedBookingForKey(b)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-4 h-4 text-teal-400" />
                      <span>Unlock Door Key</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedBookingForDining(b)}
                        className="text-slate-400 hover:text-amber-400 flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <Utensils className="w-3.5 h-3.5" />
                        <span>Room Service</span>
                      </button>

                      <button
                        onClick={() => setSelectedBookingForInvoice(b.id)}
                        className="text-slate-400 hover:text-teal-400 flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tax Invoice</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-rose-400 hover:text-rose-300 text-[11px] transition-colors"
                    >
                      Cancel Stay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Bookings & History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-white">Past Trips & Archive</h2>
        </div>

        {pastBookings.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 text-center text-xs text-slate-500">
            No completed past stays found.
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden divide-y divide-slate-800 text-xs">
            {pastBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{b.hotel?.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.booking_status === 'checked_out'
                        ? 'bg-slate-800 text-slate-300'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {b.booking_status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Room {b.room?.room_number} • {b.check_in_date} to {b.check_out_date} ({b.nights} Nights)
                  </p>
                  <p className="text-teal-400 font-mono text-[11px]">Total Paid: ₹{b.total_amount.toLocaleString()}</p>
                </div>

                <button
                  onClick={() => setSelectedBookingForInvoice(b.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-medium border border-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>Download Invoice</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedBookingForQR && (
        <QRPassModal
          booking={selectedBookingForQR}
          isOpen={!!selectedBookingForQR}
          onClose={() => setSelectedBookingForQR(null)}
          onOpenKeySimulator={(b) => {
            setSelectedBookingForQR(null);
            setSelectedBookingForKey(b);
          }}
          onOpenRoomDining={(b) => {
            setSelectedBookingForQR(null);
            setSelectedBookingForDining(b);
          }}
          onOpenInvoice={(id) => {
            setSelectedBookingForQR(null);
            setSelectedBookingForInvoice(id);
          }}
        />
      )}

      {selectedBookingForKey && (
        <DigitalKeySimulator
          booking={selectedBookingForKey}
          isOpen={!!selectedBookingForKey}
          onClose={() => setSelectedBookingForKey(null)}
        />
      )}

      {selectedBookingForDining && (
        <InRoomOrderModal
          booking={selectedBookingForDining}
          isOpen={!!selectedBookingForDining}
          onClose={() => setSelectedBookingForDining(null)}
        />
      )}

      {selectedBookingForInvoice && (
        <InvoiceViewer
          bookingId={selectedBookingForInvoice}
          isOpen={!!selectedBookingForInvoice}
          onClose={() => setSelectedBookingForInvoice(null)}
        />
      )}
    </div>
  );
};
