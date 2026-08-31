import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Printer, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { api } from '../../services/api';

interface InvoiceViewerProps {
  bookingId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({ bookingId, isOpen, onClose }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && bookingId) {
      loadInvoice();
    }
  }, [isOpen, bookingId]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const data = await api.getInvoice(bookingId);
      setInvoice(data);
    } catch (e) {
      console.error('Failed to load invoice', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(13, 148, 136); // Teal
    doc.text('SCAN & STAY HOTELS', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('Official Smart Hotel Tax Invoice & Digital Receipt', 14, 26);
    doc.text(`GSTIN: ${invoice.hotel.gstin}`, 14, 32);

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Invoice No: ${invoice.invoice_number}`, 140, 20);
    doc.text(`Date: ${invoice.date}`, 140, 26);
    doc.text(`Booking Ref: ${invoice.booking_ref}`, 140, 32);

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 38, 196, 38);

    // Hotel & Guest Info
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Property Details:', 14, 48);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(invoice.hotel.name, 14, 55);
    doc.text(invoice.hotel.address, 14, 61);
    doc.text(`${invoice.hotel.city}, ${invoice.hotel.state}`, 14, 67);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('Billed To Guest:', 120, 48);
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(invoice.guest.name, 120, 55);
    doc.text(invoice.guest.email, 120, 61);
    doc.text(invoice.guest.phone, 120, 67);

    // Stay Specs
    doc.line(14, 75, 196, 75);
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Reservation Summary', 14, 84);

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Room: Room ${invoice.stay_details.room_number} (${invoice.stay_details.room_type})`, 14, 92);
    doc.text(`Check-In: ${invoice.stay_details.check_in}`, 14, 98);
    doc.text(`Check-Out: ${invoice.stay_details.check_out} (${invoice.stay_details.nights} Nights, ${invoice.stay_details.guests} Guests)`, 14, 104);

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 112, 182, 8, 'F');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('Description', 18, 118);
    doc.text('Rate', 120, 118);
    doc.text('Amount (INR)', 160, 118);

    // Items
    doc.setTextColor(71, 85, 105);
    doc.text(`Room Accommodation (${invoice.stay_details.nights} Nights)`, 18, 128);
    doc.text(`INR ${invoice.breakdown.room_rate}`, 120, 128);
    doc.text(`INR ${invoice.breakdown.subtotal}`, 160, 128);

    if (invoice.breakdown.discount > 0) {
      doc.text(`Loyalty Reward Discount`, 18, 136);
      doc.text(`-`, 120, 136);
      doc.text(`- INR ${invoice.breakdown.discount}`, 160, 136);
    }

    doc.text(`CGST (6%)`, 18, 144);
    doc.text(`-`, 120, 144);
    doc.text(`INR ${invoice.breakdown.tax_cgst}`, 160, 144);

    doc.text(`SGST (6%)`, 18, 152);
    doc.text(`-`, 120, 152);
    doc.text(`INR ${invoice.breakdown.tax_sgst}`, 160, 152);

    doc.line(14, 158, 196, 158);

    // Grand Total
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136);
    doc.text('Grand Total Paid:', 110, 168);
    doc.text(`INR ${invoice.breakdown.grand_total.toLocaleString()}`, 160, 168);

    // Payment info
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Payment Status: ${invoice.payment.status.toUpperCase()} | Txn Ref: ${invoice.payment.transaction_ref}`, 14, 185);
    doc.text(`Security Verification: Validated via Scan & Stay HMAC Cryptographic Hash`, 14, 191);

    doc.save(`ScanStay_Invoice_${invoice.invoice_number}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl my-6"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {loading || !invoice ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading invoice data...</div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2 text-teal-400 font-extrabold text-lg tracking-tight">
                  <FileText className="w-5 h-5" />
                  <span>TAX INVOICE</span>
                </div>
                <p className="text-xs text-slate-400">Scan & Stay Verified Booking Receipt</p>
                <p className="text-[11px] text-slate-500 mt-0.5">GSTIN: {invoice.hotel.gstin}</p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-mono font-bold text-white block">{invoice.invoice_number}</span>
                <span className="text-[11px] text-slate-400 block">{invoice.date}</span>
                <span className="text-[11px] font-mono text-teal-400 block">Ref: {invoice.booking_ref}</span>
              </div>
            </div>

            {/* Billed To / Property */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hotel Property</span>
                <h4 className="font-bold text-white">{invoice.hotel.name}</h4>
                <p className="text-slate-400">{invoice.hotel.address}</p>
                <p className="text-slate-400">{invoice.hotel.city}, {invoice.hotel.state}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed To Guest</span>
                <h4 className="font-bold text-white">{invoice.guest.name}</h4>
                <p className="text-slate-400">{invoice.guest.email}</p>
                <p className="text-slate-400">{invoice.guest.phone}</p>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="rounded-2xl border border-slate-800 overflow-hidden text-xs">
              <div className="bg-slate-950 px-4 py-2.5 font-bold text-slate-300 grid grid-cols-3">
                <span className="col-span-2">Description</span>
                <span className="text-right">Amount (₹)</span>
              </div>
              <div className="p-4 space-y-2.5 divide-y divide-slate-800/60">
                <div className="grid grid-cols-3 pt-2">
                  <div className="col-span-2">
                    <span className="font-medium text-white block">Room {invoice.stay_details.room_number} ({invoice.stay_details.room_type})</span>
                    <span className="text-[11px] text-slate-400">
                      {invoice.stay_details.nights} Nights ({invoice.stay_details.check_in} to {invoice.stay_details.check_out})
                    </span>
                  </div>
                  <span className="text-right font-medium text-slate-200">₹{invoice.breakdown.subtotal.toLocaleString()}</span>
                </div>

                {invoice.breakdown.discount > 0 && (
                  <div className="grid grid-cols-3 pt-2 text-emerald-400">
                    <span className="col-span-2 font-medium">Loyalty Reward Points Discount</span>
                    <span className="text-right font-medium">- ₹{invoice.breakdown.discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="grid grid-cols-3 pt-2 text-slate-400">
                  <span className="col-span-2">Taxes & GST (CGST 6% + SGST 6%)</span>
                  <span className="text-right">₹{invoice.breakdown.total_tax.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-3 pt-3 text-sm font-bold text-white">
                  <span className="col-span-2 text-teal-400">Grand Total Paid</span>
                  <span className="text-right text-teal-300">₹{invoice.breakdown.grand_total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Payment Verified ({invoice.payment.method})</span>
              </div>

              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
