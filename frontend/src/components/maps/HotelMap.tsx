import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Hotel } from '../../types';
import { Star, MapPin, ArrowRight } from 'lucide-react';

interface HotelMapProps {
  hotels: Hotel[];
  selectedHotel?: Hotel | null;
  onSelectHotel: (hotel: Hotel) => void;
}

// Custom Map center updater component
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom = 6 }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

// Create custom luxury Leaflet div-icon
function createCustomPin(price: number, isSelected: boolean = false) {
  return L.divIcon({
    className: 'custom-hotel-pin',
    html: `
      <div class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-xl cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-amber-400 text-slate-950 scale-110 ring-4 ring-amber-400/40'
          : 'bg-teal-600 hover:bg-teal-500 text-white border border-teal-400/40 hover:scale-105'
      }">
        <span class="text-[10px]">₹</span>
        <span>${(price / 1000).toFixed(1)}k</span>
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 15],
  });
}

export const HotelMap: React.FC<HotelMapProps> = ({ hotels, selectedHotel, onSelectHotel }) => {
  const defaultCenter: [number, number] = selectedHotel
    ? [selectedHotel.latitude, selectedHotel.longitude]
    : hotels.length > 0
    ? [hotels[0].latitude, hotels[0].longitude]
    : [20.5937, 78.9629]; // India center

  return (
    <div className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative">
      <MapContainer
        center={defaultCenter}
        zoom={selectedHotel ? 13 : 5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapRecenter center={defaultCenter} zoom={selectedHotel ? 12 : 5} />
        
        {/* Dark Modern CartoDB Voyager / OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {hotels.map((hotel) => {
          const isSelected = selectedHotel?.id === hotel.id;
          return (
            <Marker
              key={hotel.id}
              position={[hotel.latitude, hotel.longitude]}
              icon={createCustomPin(hotel.base_price, isSelected)}
              eventHandlers={{
                click: () => onSelectHotel(hotel),
              }}
            >
              <Popup className="hotel-map-popup">
                <div className="w-56 p-1 text-slate-100">
                  <img
                    src={hotel.cover_image}
                    alt={hotel.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-white line-clamp-1">{hotel.name}</span>
                    <div className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
                      <Star className="w-3 h-3 fill-amber-400" />
                      <span>{hotel.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mb-2">{hotel.city}, {hotel.state}</p>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-xs font-extrabold text-teal-400">₹{hotel.base_price.toLocaleString()}</span>
                    <button
                      onClick={() => onSelectHotel(hotel)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
