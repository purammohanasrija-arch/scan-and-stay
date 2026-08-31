import React, { useState, useEffect } from 'react';
import { LayoutGrid, Map, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { Hotel } from '../types';
import { HotelCard } from '../components/hotels/HotelCard';
import { HotelFilter } from '../components/hotels/HotelFilter';
import { HotelMap } from '../components/maps/HotelMap';
import { api } from '../services/api';

interface HotelsPageProps {
  initialFilters?: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  };
  onSelectHotel: (hotel: Hotel) => void;
}

export const HotelsPage: React.FC<HotelsPageProps> = ({ initialFilters, onSelectHotel }) => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'split'>('grid');
  
  const [search, setSearch] = useState(initialFilters?.destination || '');
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [selectedAmenity, setSelectedAmenity] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedHotelOnMap, setSelectedHotelOnMap] = useState<Hotel | null>(null);

  useEffect(() => {
    fetchHotels();
  }, [search, city, maxPrice, minRating, selectedAmenity, sortBy]);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await api.getHotels({
        search: search || undefined,
        city: city || undefined,
        max_price: maxPrice,
        rating: minRating > 0 ? minRating : undefined,
        amenity: selectedAmenity || undefined,
        sort_by: sortBy,
      });
      setHotels(data);
    } catch (e) {
      console.error('Failed to fetch hotels', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setCity('');
    setMaxPrice(10000);
    setMinRating(0);
    setSelectedAmenity('');
    setSortBy('popular');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Explore Smart Hotels</h1>
          <p className="text-xs text-slate-400 mt-1">
            {loading ? 'Finding stays...' : `Found ${hotels.length} verified contactless smart properties`}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'split'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map Split</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1">
          <HotelFilter
            search={search}
            setSearch={setSearch}
            city={city}
            setCity={setCity}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            minRating={minRating}
            setMinRating={setMinRating}
            selectedAmenity={selectedAmenity}
            setSelectedAmenity={setSelectedAmenity}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onReset={handleReset}
          />
        </div>

        {/* Right Results Grid or Map Split */}
        <div className="lg:col-span-3">
          {viewMode === 'grid' ? (
            loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="rounded-2xl bg-slate-900 border border-slate-800 h-80 animate-pulse" />
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center space-y-3">
                <p className="text-sm font-bold text-white">No properties match your filter criteria.</p>
                <p className="text-xs text-slate-400">Try adjusting your price range or clearing destination filters.</p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 font-bold text-xs"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onSelect={onSelectHotel}
                  />
                ))}
              </div>
            )
          ) : (
            /* Split View: List on left + Interactive Map on right */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[720px]">
              <div className="overflow-y-auto space-y-4 pr-1">
                {hotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    onMouseEnter={() => setSelectedHotelOnMap(hotel)}
                  >
                    <HotelCard
                      hotel={hotel}
                      onSelect={onSelectHotel}
                    />
                  </div>
                ))}
              </div>
              <div className="h-full">
                <HotelMap
                  hotels={hotels}
                  selectedHotel={selectedHotelOnMap}
                  onSelectHotel={onSelectHotel}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
