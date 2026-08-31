import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Calendar, Users, QrCode, Shield, Key, Sparkles,
  ArrowRight, Star, MapPin, Zap, CheckCircle2, ShieldCheck, Waves
} from 'lucide-react';
import { Hotel } from '../types';
import { HotelCard } from '../components/hotels/HotelCard';

interface HomePageProps {
  hotels: Hotel[];
  onSelectHotel: (hotel: Hotel) => void;
  onNavigate: (page: string, data?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ hotels, onSelectHotel, onNavigate }) => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Guests');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('hotels', { destination, checkIn, checkOut, guests });
  };

  const featuredHotels = hotels.filter((h) => h.featured).slice(0, 3);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-8 sm:pt-16 pb-12 overflow-hidden">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-teal-500/30 text-teal-300 text-xs font-semibold shadow-lg shadow-teal-500/10 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Next-Gen Smart Hotel Reservation & QR Access</span>
          </motion.div>

          {/* Hero Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]"
          >
            Scan, Check-In & Stay{' '}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
              In 5 Seconds
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-4 leading-relaxed"
          >
            Say goodbye to reception queues and plastic keycards. Book verified luxury hotels, receive cryptographically signed QR passes, and unlock your room door with smart digital keys.
          </motion.p>

          {/* Search Bar Widget */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSearch}
            className="mt-8 sm:mt-10 max-w-5xl mx-auto rounded-3xl bg-slate-900/95 border border-slate-800 p-3 sm:p-4 shadow-2xl shadow-teal-500/10 backdrop-blur-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left"
          >
            {/* Destination */}
            <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" />
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Goa, Jaipur, Manali..."
                className="w-full bg-transparent text-sm font-semibold text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Check-in */}
            <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-teal-400" />
                Check-in Date
              </label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-200 focus:outline-none"
              />
            </div>

            {/* Check-out */}
            <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-teal-400" />
                Check-out Date
              </label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-slate-200 focus:outline-none"
              />
            </div>

            {/* Guests & Submit */}
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-teal-500/50 transition-colors">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-teal-400" />
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-white focus:outline-none"
                >
                  <option value="1 Guest" className="bg-slate-900">1 Guest</option>
                  <option value="2 Guests" className="bg-slate-900">2 Guests</option>
                  <option value="3 Guests" className="bg-slate-900">3 Guests</option>
                  <option value="4+ Guests" className="bg-slate-900">4+ Guests</option>
                </select>
              </div>

              <button
                type="submit"
                className="h-full px-5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-teal-500/25 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </motion.form>

          {/* Stats Bar */}
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xl sm:text-2xl font-black text-teal-400">5 Sec</div>
              <div className="text-[11px] text-slate-400 font-medium">QR Express Check-in</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xl sm:text-2xl font-black text-white">100%</div>
              <div className="text-[11px] text-slate-400 font-medium">HMAC Signed Security</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xl sm:text-2xl font-black text-amber-400">4.9 ★</div>
              <div className="text-[11px] text-slate-400 font-medium">Guest Satisfaction</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">24/7</div>
              <div className="text-[11px] text-slate-400 font-medium">AI StayBot Concierge</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Smart Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">How It Works</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Frictionless Travel in 4 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Discover & Book',
              desc: 'Browse handpicked luxury stays, check live room availability, and checkout via Razorpay/UPI.',
              icon: Search,
              color: 'text-teal-400',
              bg: 'bg-teal-500/10',
            },
            {
              step: '02',
              title: 'Instant QR Pass',
              desc: 'Get an HMAC-SHA256 cryptographically signed digital pass delivered to WhatsApp and Email.',
              icon: QrCode,
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10',
            },
            {
              step: '03',
              title: '5-Sec Check-in',
              desc: 'Scan your QR pass at the reception kiosk scanner for immediate key verification without queues.',
              icon: Zap,
              color: 'text-amber-400',
              bg: 'bg-amber-500/10',
            },
            {
              step: '04',
              title: 'Smart Key & Orders',
              desc: 'Unlock your room door with digital IoT keys and order gourmet dining with a single tap.',
              icon: Key,
              color: 'text-purple-400',
              bg: 'bg-purple-500/10',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col justify-between hover:border-teal-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-teal-500/5 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-3 rounded-2xl ${item.bg} ${item.color} border border-white/5`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 group-hover:text-teal-400/80 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Properties Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Handpicked Luxury</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Trending Smart Properties</h2>
          </div>
          <button
            onClick={() => onNavigate('hotels')}
            className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredHotels.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onSelect={onSelectHotel}
            />
          ))}
        </div>
      </section>

      {/* Interactive Map Teaser Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-950/80 via-slate-900 to-slate-900 border border-teal-500/30 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="max-w-xl space-y-4 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Interactive Map Explorer
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Explore Luxury Stays Across Prime Indian Destinations
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Use our live map explorer to inspect beachfront resorts in Goa, royal Havelis in Jaipur, mountain chalets in Manali, and tech suites in Bengaluru with exact distance metrics.
            </p>
            <button
              onClick={() => onNavigate('hotels')}
              className="px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Launch Interactive Map</span>
            </button>
          </div>

          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 hidden lg:block bg-gradient-to-l from-teal-500 to-transparent pointer-events-none" />
        </div>
      </section>
    </div>
  );
};
