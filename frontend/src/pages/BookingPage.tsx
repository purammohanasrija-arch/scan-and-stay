import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  CreditCard, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft,
  Calendar, Users, Building2, Sparkles, QrCode, Lock, Zap, FileText
} from 'lucide-react';
import { HotelDetail, Room, Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { QRPassModal } from '../components/qr/QRPassModal';
import { DigitalKeySimulator } from '../components/qr/DigitalKeySimulator';

interface BookingPageProps {
  hotel: HotelDetail;
  room: Room;
  onBack: () => void;
  onNavigateToDashboard: () => void;
}

export const BookingPage: React.FC<BookingPageProps> = ({
  hotel,
  room,
  onBack,
  onNavigateToDashboard,
}) => {
  const { user, refreshProfile } = useAuth();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState(tomorrowStr);
  const [guestCount, setGuestCount] = useState(2);
  const [guestName, setGuestName] = useState(user?.name || 'Rahul Verma');
  const [guestEmail, setGuestEmail] = useState(user?.email || 'guest@scanstay.com');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+91 98222 33445');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [redeemPoints, setRedeemPoints] = useState(user ? user.loyalty_points >= 200 : false);

  // Completed booking state
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showQRModal, setShowQRModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Calculate nights & pricing
  const cin = new Date(checkInDate);
  const cout = new Date(checkOutDate);
  const diffTime = Math.max(1, Math.ceil((cout.getTime() - cin.getTime()) / (1000 * 60 * 60 * 24)));
  const nights = isNaN(diffTime) ? 1 : diffTime;

  const roomSubtotal = room.price_per_night * nights;
  const taxAmount = Math.round(roomSubtotal * 0.12);
  const discountAmount = redeemPoints && (user?.loyalty_points || 0) >= 200 ? 200 : 0;
  const totalAmount = Math.max(0, roomSubtotal + taxAmount - discountAmount);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleExecutePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Create simulated order
      await api.createPaymentOrder(totalAmount);

      // 2. Complete reservation
      const booking = await api.createBooking({
        hotel_id: hotel.id,
        room_id: room.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests_count: guestCount,
        special_requests: specialRequests,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        payment_method: paymentMethod,
      });

      setCreatedBooking(booking);
      setStep(3);

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#14b8a6', '#10b981', '#38bdf8', '#f59e0b'],
      });

      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Steps */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hotel Overview</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Fast Checkout</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {step === 3 ? '🎉 Stay Confirmed & QR Ready!' : `Reserve: ${hotel.name}`}
            </h1>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`px-3 py-1 rounded-full ${step >= 1 ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              1. Details
            </span>
            <span className="text-slate-600">→</span>
            <span className={`px-3 py-1 rounded-full ${step >= 2 ? 'bg-teal-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              2. Payment
            </span>
            <span className="text-slate-600">→</span>
            <span className={`px-3 py-1 rounded-full ${step === 3 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
              3. QR Pass
            </span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Guest Information Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleProceedToPayment} className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-5 shadow-2xl">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Guest Information</span>
                <span className="text-xs font-normal text-slate-400">(Auto-linked to Digital QR Pass)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Primary Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Guests Count</label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value={1}>1 Adult</option>
                    <option value={2}>2 Adults</option>
                    <option value={3}>3 Adults</option>
                    <option value={4}>4 Adults (Suite)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email for QR Boarding Pass</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">WhatsApp Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Special Requests (Optional)</label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="e.g. High floor, early morning check-in, extra pillows..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Booking Summary Card */}
          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white">Summary of Stay</h3>

              <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
                <img
                  src={hotel.cover_image}
                  alt={hotel.name}
                  className="w-16 h-16 rounded-xl object-cover bg-slate-950"
                />
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{hotel.name}</h4>
                  <p className="text-[11px] text-teal-400">{room.room_type} (Room {room.room_number})</p>
                  <p className="text-[10px] text-slate-400">{nights} Night(s) Stay</p>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Room Rate (₹{room.price_per_night} x {nights}n)</span>
                  <span>₹{roomSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Taxes & GST (12%)</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>

                {user && user.loyalty_points >= 200 && (
                  <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between text-teal-300">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={redeemPoints}
                        onChange={(e) => setRedeemPoints(e.target.checked)}
                        className="accent-teal-500"
                      />
                      <span>Redeem 200 Pts (-₹200)</span>
                    </label>
                    <span className="font-bold">-₹200</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-extrabold text-white">
                  <span>Grand Total</span>
                  <span className="text-teal-400">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant QR Pass generation with anti-replay signature guarantee</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Payment Gateway Selection */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-teal-400" />
                  <span>Choose Payment Method</span>
                </h3>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  Razorpay 256-Bit SSL
                </span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
                  {error}
                </div>
              )}

              {/* Payment Methods */}
              <div className="space-y-3">
                {[
                  {
                    id: 'card',
                    name: 'Credit / Debit Card (Visa, MasterCard, RuPay)',
                    desc: 'Instant confirmation & 50 Welcome Loyalty points',
                    badge: 'Instant',
                  },
                  {
                    id: 'upi',
                    name: 'UPI / QR Payment (Google Pay, PhonePe, Paytm)',
                    desc: 'Pay directly via your bank UPI app',
                    badge: 'Zero Fee',
                  },
                  {
                    id: 'netbanking',
                    name: 'Net Banking (All Major Indian Banks)',
                    desc: 'HDFC, ICICI, SBI, Axis & 40+ banks supported',
                    badge: 'Secure',
                  },
                ].map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === method.id
                        ? 'bg-teal-950/30 border-teal-500 ring-1 ring-teal-500/40'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{method.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 font-semibold">
                          {method.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{method.desc}</p>
                    </div>

                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      paymentMethod === method.id ? 'border-teal-500 bg-teal-500' : 'border-slate-600'
                    }`}>
                      {paymentMethod === method.id && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Card Input if Card selected */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 8891"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Expiry</label>
                      <input
                        type="text"
                        defaultValue="08/29"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">CVV</label>
                      <input
                        type="password"
                        defaultValue="892"
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Back
                </button>

                <button
                  type="button"
                  onClick={handleExecutePayment}
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loading ? 'Processing Payment & Generating Pass...' : `Pay ₹${totalAmount.toLocaleString()} Now`}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Order Summary</h4>
              <div className="text-2xl font-black text-teal-400">₹{totalAmount.toLocaleString()}</div>
              <p className="text-[11px] text-slate-400">
                Includes all taxes and resort fees. Zero hidden charges.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Success Confirmation & Instant QR Pass Ready */}
      {step === 3 && createdBooking && (
        <div className="rounded-3xl bg-slate-900 border border-teal-500/40 p-8 text-center space-y-6 shadow-2xl shadow-teal-500/10">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white">Booking Confirmed!</h2>
            <p className="text-xs text-slate-400">
              Reservation Reference:{' '}
              <strong className="text-teal-300 font-mono">{createdBooking.booking_ref}</strong>
            </p>
          </div>

          <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
            Your tamper-proof QR Boarding Pass and Smart Keycard have been generated. We've dispatched confirmation alerts to your WhatsApp and Email!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setShowQRModal(true)}
              className="px-6 py-3 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>View QR Boarding Pass</span>
            </button>

            <button
              onClick={() => setShowKeyModal(true)}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Test IoT Room Key</span>
            </button>

            <button
              onClick={onNavigateToDashboard}
              className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors"
            >
              Go to My Stays
            </button>
          </div>
        </div>
      )}

      {/* Modals for QR Pass and Keycard */}
      {createdBooking && (
        <>
          <QRPassModal
            booking={createdBooking}
            isOpen={showQRModal}
            onClose={() => setShowQRModal(false)}
            onOpenKeySimulator={() => {
              setShowQRModal(false);
              setShowKeyModal(true);
            }}
          />

          <DigitalKeySimulator
            booking={createdBooking}
            isOpen={showKeyModal}
            onClose={() => setShowKeyModal(false)}
          />
        </>
      )}
    </div>
  );
};
