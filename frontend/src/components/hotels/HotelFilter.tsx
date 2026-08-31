import React from 'react';
import { Search, SlidersHorizontal, Star, X, Check } from 'lucide-react';

interface HotelFilterProps {
  search: string;
  setSearch: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  minRating: number;
  setMinRating: (val: number) => void;
  selectedAmenity: string;
  setSelectedAmenity: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  onReset: () => void;
}

const CITIES = ['All Cities', 'Goa', 'Jaipur', 'Bengaluru', 'Manali', 'Udaipur', 'Mumbai'];
const AMENITIES = ['WiFi', 'Pool', 'Spa', 'Smart Room IoT', 'Beachfront', 'Mountain View', 'Fine Dining'];

export const HotelFilter: React.FC<HotelFilterProps> = ({
  search,
  setSearch,
  city,
  setCity,
  maxPrice,
  setMaxPrice,
  minRating,
  setMinRating,
  selectedAmenity,
  setSelectedAmenity,
  sortBy,
  setSortBy,
  onReset,
}) => {
  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <SlidersHorizontal className="w-4 h-4 text-teal-400" />
          <span>Filters & Preferences</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-teal-400 transition-colors"
        >
          Reset All
        </button>
      </div>

      {/* Destination / Keyword Search */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination or Hotel</label>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, city, landmark..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* City Chips */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Popular Cities</label>
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((c) => {
            const isSelected = (c === 'All Cities' && !city) || city === c;
            return (
              <button
                key={c}
                onClick={() => setCity(c === 'All Cities' ? '' : c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-md shadow-teal-500/20'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Range Slider */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300">Max Budget / Night</span>
          <span className="font-bold text-teal-400">Up to ₹{maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={2000}
          max={10000}
          step={500}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-teal-500 cursor-pointer bg-slate-950 rounded-lg h-2"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>₹2,000</span>
          <span>₹6,000</span>
          <span>₹10,000+</span>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Minimum Rating</label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Any', val: 0 },
            { label: '4.0+', val: 4.0 },
            { label: '4.5+', val: 4.5 },
            { label: '4.8+', val: 4.8 },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => setMinRating(r.val)}
              className={`py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                minRating === r.val
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {r.val > 0 && <Star className="w-3 h-3 fill-current" />}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Amenities Tags */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-2">Featured Amenities</label>
        <div className="flex flex-wrap gap-1.5">
          {AMENITIES.map((amenity) => {
            const isSelected = selectedAmenity === amenity;
            return (
              <button
                key={amenity}
                onClick={() => setSelectedAmenity(isSelected ? '' : amenity)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/50'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-teal-400" />}
                <span>{amenity}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort Option */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sort Order</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors"
        >
          <option value="popular">Most Popular & Recommended</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Highest Guest Rating</option>
        </select>
      </div>
    </div>
  );
};
