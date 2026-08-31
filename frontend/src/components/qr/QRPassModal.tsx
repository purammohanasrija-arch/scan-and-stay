import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, Download, Key, QrCode, ShieldCheck, Calendar, Clock,
  MapPin, CheckCircle, Copy, FileText, Sparkles, Utensils
} from 'lucide-react';
import { Booking } from '../../types';

interface QRPassModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onOpenKeySimulator: (booking: Booking) => void;
  onOpenRoomDining?: (booking: Booking) => void;
  onOpenInvoice?: (bookingId: number) => void;
}

export const QRPassModal: React.FC<QRPassModalProps> = ({
  booking,
  isOpen,
  onClose,
  onOpenKeySimulator,
  onOpenRoomDining,
  onOpenInvoice,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qrImage = booking.qr_pass?.qr_code_image || '';
  const qrToken = booking.qr_pass?.qr_token || '';

  const handleCopyToken = () => {
    navigator.clipboard.writeText(qrToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrImage) return;
    const link = document.createElement('a');
    link.href = qrImage;
    link.download = `ScanStay_QRPass_${booking.booking_ref}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-6"
      >
        {/* Top Header Strip */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-950/20 backdrop-blur-sm">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight leading-tight">Digital Smart Pass</h3>
              <p className="text-[11px] font-semibold opacity-90">Scan & Stay Express Check-In</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 transition-colors"
          >
            <X className="w-5 h-5 text-slate-950" />
          </button>
        </div>

        {/* Boarding Pass Body */}
        <div className="p-6 space-y-6">
          {/* Hotel & Guest Details */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Property</span>
              <h4 className="text-base font-bold text-white leading-snug">{booking.hotel?.name}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-teal-400" />
                <span>{booking.hotel?.city}, {booking.hotel?.state}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Ref</span>
              <div className="text-xs font-mono font-bold text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                {booking.booking_ref}
              </div>
            </div>
          </div>

          {/* Key Stay Attributes Grid */}
          <div className="grid grid-cols-3 gap-3 bg-slate-950/80 rounded-2xl p-4 border border-slate-800">
            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase block">Room Allocated</span>
              <span className="text-sm font-extrabold text-white">
                Room {booking.room?.room_number || '101'}
              </span>
              <span className="text-[10px] text-teal-400 block truncate">{booking.room?.room_type}</span>
            </div>

            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase block">Check-In</span>
              <span className="text-xs font-bold text-white block">{booking.check_in_date}</span>
              <span className="text-[10px] text-slate-400">12:00 PM</span>
            </div>

            <div>
              <span className="text-[10px] font-medium text-slate-400 uppercase block">Check-Out</span>
              <span className="text-xs font-bold text-white block">{booking.check_out_date}</span>
              <span className="text-[10px] text-slate-400">11:00 AM</span>
            </div>
          </div>

          {/* Scannable Cryptographic QR Container */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white text-slate-950 shadow-inner relative overflow-hidden">
            {/* Holographic Security Banner */}
            <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1">
              <span className="flex items-center gap-1 text-teal-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                HMAC-SHA256 Encrypted
              </span>
              <span className="text-emerald-600">Status: {booking.booking_status.toUpperCase()}</span>
            </div>

            {/* QR Image with laser scanner animation */}
            <div className="relative p-2 bg-white rounded-xl shadow-sm">
              {qrImage ? (
                <img
                  src={qrImage}
                  alt={`QR Pass for ${booking.booking_ref}`}
                  className="w-48 h-48 object-contain rounded-lg"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg text-slate-400 text-xs">
                  Generating QR Pass...
                </div>
              )}
              
              {/* Laser line */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 shadow-md shadow-teal-500 animate-scanner-laser pointer-events-none" />
            </div>

            <p className="text-[11px] font-medium text-slate-600 mt-2 text-center">
              Scan at reception desk for instant 5-second check-in
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => onOpenKeySimulator(booking)}
              className="px-3 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-bold text-xs hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Key className="w-4 h-4" />
              <span>Unlock Door Key</span>
            </button>

            {onOpenRoomDining && (
              <button
                onClick={() => onOpenRoomDining(booking)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <Utensils className="w-4 h-4 text-amber-400" />
                <span>Room Dining</span>
              </button>
            )}

            <button
              onClick={handleDownloadQR}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-700 col-span-2 sm:col-span-1"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Save Pass</span>
            </button>
          </div>

          {/* Raw Token / Manual Copy Strip */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
            <div className="truncate mr-2">
              <span className="text-[10px] text-slate-500 block">Encrypted Pass Token</span>
              <span className="font-mono text-slate-400 text-[11px] truncate block max-w-[280px]">
                {qrToken.slice(0, 32)}...
              </span>
            </div>
            <button
              onClick={handleCopyToken}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
