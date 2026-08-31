import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Unlock, Key, Wifi, Sparkles, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { Booking } from '../../types';
import { api } from '../../services/api';

interface DigitalKeySimulatorProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalKeySimulator: React.FC<DigitalKeySimulatorProps> = ({ booking, isOpen, onClose }) => {
  const [unlockState, setUnlockState] = useState<'locked' | 'transmitting' | 'unlocked' | 'error'>('locked');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Hold phone near room lock sensor & tap to unlock');

  if (!isOpen) return null;

  const handleUnlock = async () => {
    if (unlockState === 'transmitting' || unlockState === 'unlocked') return;

    setUnlockState('transmitting');
    setFeedbackMsg('🔐 Transmitting HMAC token over encrypted NFC/BLE...');

    try {
      const qrToken = booking.qr_pass?.qr_token || '';
      const res = await api.unlockDoor(booking.booking_ref, qrToken);
      
      setTimeout(() => {
        setUnlockState('unlocked');
        setFeedbackMsg(res.message || `Room ${booking.room?.room_number} unlocked successfully!`);
        
        // Auto relock after 6 seconds
        setTimeout(() => {
          setUnlockState('locked');
          setFeedbackMsg('Hold phone near room lock sensor & tap to unlock');
        }, 6000);
      }, 1200);
    } catch (err: any) {
      setUnlockState('error');
      setFeedbackMsg(err.message || 'Access Denied. Ensure booking is active.');
      setTimeout(() => {
        setUnlockState('locked');
        setFeedbackMsg('Hold phone near room lock sensor & tap to unlock');
      }, 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-7 shadow-2xl overflow-hidden text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider mb-4">
          <Cpu className="w-4 h-4" />
          <span>Smart IoT Room Key</span>
        </div>

        {/* 3D Keycard Visual */}
        <div
          onClick={handleUnlock}
          className={`relative w-full h-56 rounded-2xl p-5 flex flex-col justify-between text-left cursor-pointer select-none transition-all duration-500 shadow-2xl ${
            unlockState === 'unlocked'
              ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 border-2 border-emerald-400 shadow-emerald-500/30 scale-105'
              : unlockState === 'transmitting'
              ? 'bg-gradient-to-br from-amber-600 via-teal-800 to-slate-900 border-2 border-amber-400 animate-pulse'
              : unlockState === 'error'
              ? 'bg-gradient-to-br from-rose-900 via-slate-900 to-slate-950 border-2 border-rose-500 shadow-rose-500/20'
              : 'bg-gradient-to-br from-slate-800 via-slate-900 to-teal-950/80 border border-teal-500/30 hover:border-teal-500/60 hover:scale-[1.02]'
          }`}
        >
          {/* Top Card Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center">
                <Key className="w-4 h-4 text-teal-300" />
              </div>
              <span className="text-xs font-bold text-white/90">Scan & Stay Keycard</span>
            </div>
            <Wifi className="w-4 h-4 text-teal-400 animate-pulse" />
          </div>

          {/* Center Room Number */}
          <div className="my-auto py-2">
            <span className="text-[10px] font-bold text-teal-300/80 uppercase tracking-widest block">Allocated Room</span>
            <div className="text-3xl font-black text-white tracking-tight">
              Room {booking.room?.room_number || '101'}
            </div>
            <span className="text-xs font-medium text-slate-300 line-clamp-1">
              {booking.hotel?.name}
            </span>
          </div>

          {/* Bottom Card Bar */}
          <div className="flex items-end justify-between text-[11px] text-white/80 pt-2 border-t border-white/10">
            <div>
              <span className="text-[9px] text-white/60 uppercase block">Guest</span>
              <span className="font-semibold">{booking.guest_name}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-white/60 uppercase block">Valid Until</span>
              <span className="font-mono">{booking.check_out_date}</span>
            </div>
          </div>
        </div>

        {/* Lock State Indicator & Action */}
        <div className="mt-6 space-y-4">
          <div className="flex justify-center">
            <button
              onClick={handleUnlock}
              disabled={unlockState === 'transmitting'}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${
                unlockState === 'unlocked'
                  ? 'bg-emerald-500 text-slate-950 ring-8 ring-emerald-500/20'
                  : unlockState === 'transmitting'
                  ? 'bg-amber-500 text-slate-950 ring-8 ring-amber-500/20 animate-spin'
                  : unlockState === 'error'
                  ? 'bg-rose-500 text-white ring-8 ring-rose-500/20'
                  : 'bg-slate-800 hover:bg-teal-500 text-teal-400 hover:text-slate-950 ring-4 ring-slate-800'
              }`}
            >
              {unlockState === 'unlocked' ? (
                <Unlock className="w-8 h-8" />
              ) : (
                <Lock className="w-7 h-7" />
              )}
            </button>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {unlockState === 'unlocked'
                ? 'DOOR UNLOCKED'
                : unlockState === 'transmitting'
                ? 'VERIFYING...'
                : unlockState === 'error'
                ? 'ACCESS REJECTED'
                : 'TAP TO UNLOCK ROOM'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {feedbackMsg}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
