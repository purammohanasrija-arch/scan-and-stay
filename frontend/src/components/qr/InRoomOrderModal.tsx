import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Utensils, Plus, Minus, CheckCircle, ShoppingBag, Sparkles } from 'lucide-react';
import { Booking } from '../../types';
import { api } from '../../services/api';

interface InRoomOrderModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

const MENU_ITEMS = [
  { id: '1', name: 'Artisan Club Sandwich', category: 'Dining', price: 450, desc: 'Grilled chicken/paneer with cheddar & herb fries' },
  { id: '2', name: 'Signature Truffle Fries', category: 'Dining', price: 320, desc: 'Crispy hand-cut potatoes with parmesan & truffle aioli' },
  { id: '3', name: 'South Indian Filter Coffee / Masala Chai', category: 'Beverages', price: 180, desc: 'Freshly brewed aromatic blend with warm cookies' },
  { id: '4', name: 'Tropical Fruit Platter', category: 'Dining', price: 290, desc: 'Seasonal fresh cut fruits with honey lime drizzle' },
  { id: '5', name: 'Fresh Linen & Extra Towels', category: 'Housekeeping', price: 0, desc: 'Set of 2 plush bath towels & organic toiletries' },
  { id: '6', name: 'Aroma Diffuser & Pillow Mist', category: 'Wellness', price: 0, desc: 'Lavender & chamomile sleep wellness amenity' },
];

export const InRoomOrderModal: React.FC<InRoomOrderModalProps> = ({ booking, isOpen, onClose }) => {
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  if (!isOpen) return null;

  const updateQuantity = (id: string, delta: number) => {
    setQuantities((prev) => {
      const curr = prev[id] || 0;
      const next = Math.max(0, curr + delta);
      return { ...prev, [id]: next };
    });
  };

  const selectedItems = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const item = MENU_ITEMS.find((m) => m.id === id)!;
      return { ...item, quantity: qty };
    });

  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return;

    setSubmitting(true);
    try {
      await api.createInRoomOrder({
        booking_id: booking.id,
        room_id: booking.room_id,
        items: JSON.stringify(selectedItems),
        total_price: totalPrice,
        notes: notes || undefined,
      });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setQuantities({});
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl my-6"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">In-Room Dining & Services</h3>
            <p className="text-xs text-slate-400">
              Delivering to Room <strong className="text-teal-400">{booking.room?.room_number || '101'}</strong> ({booking.hotel?.name})
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Order Dispatched to Room Service!</h4>
            <p className="text-xs text-slate-400">Estimated delivery: 15-20 minutes to your door.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {MENU_ITEMS.map((item) => {
                const qty = quantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                      <span className="text-xs font-semibold text-teal-400 mt-1 block">
                        {item.price === 0 ? 'Complimentary' : `₹${item.price}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 bg-slate-900 rounded-lg p-1 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-white w-4 text-center">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 rounded text-teal-400 hover:text-teal-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Special Instructions</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Less spicy, leave at door, extra napkins..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Bill</span>
                <span className="text-base font-bold text-white">₹{totalPrice.toLocaleString()}</span>
              </div>

              <button
                type="submit"
                disabled={submitting || selectedItems.length === 0}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{submitting ? 'Placing Order...' : 'Confirm Room Order'}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
