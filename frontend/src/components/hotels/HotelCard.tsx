import React, { useState } from 'react';
import { Star, MapPin, Wifi, Sparkles, Heart, ArrowRight, ShieldCheck, Waves, Coffee } from 'lucide-react';
import { Hotel } from '../../types';

interface HotelCardProps {
  hotel: Hotel;
  onSelect: (hotel: Hotel) => void;
  onViewMap?: (hotel: Hotel) => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onSelect, onViewMap }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  let amenitiesList: string[] = [];
  try {
    amenitiesList = typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : hotel.amenities;
  } catch {
    amenitiesList = ['Free High-Speed WiFi', 'Smart QR Keycard', 'AC'];
  }

  return (
    <div className="group rounded-2xl bg-slate-900 border border-slate-800/90 overflow-hidden hover:border-teal-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 flex flex-col">
      {/* Cover Image Container */}
      <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-950">
        <img
          src={hotel.cover_image}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

        {/* Featured / QR Smart Badge */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5">
          {hotel.featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/90 text-slate-950 backdrop-blur-md shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-slate-950" />
              Featured
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-teal-500/90 text-slate-950 backdrop-blur-md shadow-md flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            QR Smart Key
          </span>
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950/90 backdrop-blur-md text-slate-300 hover:text-rose-400 border border-white/10 transition-colors"
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* City and Rating Overlay */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-end justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-200 bg-slate-950/70 px-2.5 py-1 rounded-lg backdrop-blur-md border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-medium">{hotel.city}, {hotel.state}</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-950 bg-amber-400 px-2 py-1 rounded-lg shadow-md">
            <Star className="w-3.5 h-3.5 fill-slate-950" />
            <span>{hotel.rating.toFixed(1)}</span>
            <span className="text-[10px] font-medium text-slate-800">({hotel.review_count})</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-teal-400 transition-colors line-clamp-1">
            {hotel.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {hotel.description}
          </p>

          {/* Amenities Pills */}
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {amenitiesList.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] bg-slate-800/80 text-slate-300 border border-slate-700/50"
              >
                {amenity}
              </span>
            ))}
            {amenitiesList.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-slate-800/50 text-slate-400">
                +{amenitiesList.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Book Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-white">₹{hotel.base_price.toLocaleString()}</span>
              <span className="text-xs text-slate-400">/ night</span>
            </div>
          </div>

          <button
            onClick={() => onSelect(hotel)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 border border-teal-500/30 hover:border-teal-500 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>View Rooms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
