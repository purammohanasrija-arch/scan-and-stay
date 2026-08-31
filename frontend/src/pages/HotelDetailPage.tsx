import React, { useState, useEffect } from 'react';
import {
  Star, MapPin, Wifi, ShieldCheck, Check, ArrowLeft, Users,
  Bed, Sparkles, MessageSquare, Heart, Share2, Plus, Calendar
} from 'lucide-react';
import { HotelDetail, Room, Feedback } from '../types';
import { HotelMap } from '../components/maps/HotelMap';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface HotelDetailPageProps {
  hotelId: number;
  onBack: () => void;
  onSelectRoomToBook: (hotel: HotelDetail, room: Room) => void;
}

export const HotelDetailPage: React.FC<HotelDetailPageProps> = ({
  hotelId,
  onBack,
  onSelectRoomToBook,
}) => {
  const { user } = useAuth();
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    loadHotelDetails();
  }, [hotelId]);

  const loadHotelDetails = async () => {
    setLoading(true);
    try {
      const data = await api.getHotelById(hotelId);
      setHotel(data);
      setSelectedImage(data.cover_image);

      const fbData = await api.getFeedbacks(hotelId);
      setFeedbacks(fbData);
    } catch (e) {
      console.error('Failed to load hotel detail', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !hotel || !reviewText.trim()) return;

    setSubmittingReview(true);
    try {
      await api.submitFeedback({
        hotel_id: hotel.id,
        booking_id: 1, // sample link
        rating: rating,
        cleanliness_rating: 5,
        service_rating: 5,
        location_rating: 5,
        review_text: reviewText,
      });

      setShowReviewModal(false);
      setReviewText('');
      loadHotelDetails();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading property details...
      </div>
    );
  }

  let gallery: string[] = [hotel.cover_image];
  try {
    const parsed = typeof hotel.gallery_images === 'string' ? JSON.parse(hotel.gallery_images) : hotel.gallery_images;
    if (Array.isArray(parsed) && parsed.length > 0) gallery = parsed;
  } catch {}

  let amenitiesList: string[] = [];
  try {
    amenitiesList = typeof hotel.amenities === 'string' ? JSON.parse(hotel.amenities) : hotel.amenities;
  } catch {
    amenitiesList = ['Free High-Speed WiFi', 'Smart QR Keycard', 'AC'];
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Back Button & Title Header */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-teal-400 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hotels</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">{hotel.name}</h1>
              {hotel.featured && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Featured
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-400" />
              <span>{hotel.address}, {hotel.city}, {hotel.state}, {hotel.country}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2">
              <div className="text-right">
                <div className="text-xs font-bold text-white">Exceptional</div>
                <div className="text-[10px] text-slate-400">{hotel.review_count} verified reviews</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg">
                {hotel.rating.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 h-[340px] sm:h-[450px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative">
          <img
            src={selectedImage || hotel.cover_image}
            alt={hotel.name}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 text-teal-400 backdrop-blur-md border border-teal-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Smart QR Certified
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 h-[340px] sm:h-[450px]">
          {gallery.slice(0, 3).map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedImage(imgUrl)}
              className={`rounded-2xl overflow-hidden bg-slate-950 border cursor-pointer relative transition-all ${
                selectedImage === imgUrl ? 'border-teal-500 ring-2 ring-teal-500/40' : 'border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={imgUrl} alt="Thumbnail" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Amenities & Description Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white">About the Property</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {hotel.description}
            </p>
          </div>

          {/* Full Amenities */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-4">
            <h2 className="text-lg font-bold text-white">Amenities & Smart Features</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenitiesList.map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-200"
                >
                  <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Map Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white mb-2">Location & Neighborhood</h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Prime location in {hotel.city}. Minutes away from top landmarks, beaches, and dining promenades.
            </p>
            <div className="h-56 rounded-2xl overflow-hidden border border-slate-800">
              <HotelMap hotels={[hotel]} selectedHotel={hotel} onSelectHotel={() => {}} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Exact GPS: {hotel.latitude.toFixed(4)}, {hotel.longitude.toFixed(4)}</span>
          </div>
        </div>
      </div>

      {/* Available Rooms Section */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Select Room</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Available Room Categories</h2>
        </div>

        <div className="space-y-4">
          {hotel.rooms.map((room) => {
            let roomImages: string[] = [hotel.cover_image];
            try {
              roomImages = JSON.parse(room.images);
            } catch {}

            return (
              <div
                key={room.id}
                className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-teal-500/40 transition-all shadow-xl"
              >
                {/* Room Info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <img
                    src={roomImages[0] || hotel.cover_image}
                    alt={room.room_type}
                    className="w-full sm:w-44 h-32 object-cover rounded-2xl bg-slate-950 shrink-0 border border-slate-800"
                  />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{room.room_type}</h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        Room {room.room_number}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-teal-400" />
                        Up to {room.capacity} Guests
                      </span>
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-teal-400" />
                        {room.bed_type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Wifi className="w-3.5 h-3.5 text-teal-400" />
                        Ultra WiFi
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                      {room.description}
                    </p>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase block">Per Night Rate</span>
                    <span className="text-2xl font-black text-white">₹{room.price_per_night.toLocaleString()}</span>
                    <span className="text-[10px] text-teal-400 block">+ ₹{Math.round(room.price_per_night * 0.12)} Taxes (12%)</span>
                  </div>

                  <button
                    onClick={() => onSelectRoomToBook(hotel, room)}
                    className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5"
                  >
                    <span>Reserve Room</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guest Reviews Section */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Guest Reviews & Feedback</h2>
            <p className="text-xs text-slate-400">Verified experiences from guests who checked in with QR smart passes</p>
          </div>

          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {feedbacks.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No reviews yet for this hotel. Be the first to share your experience!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs flex items-center justify-center">
                      {fb.user?.name ? fb.user.name[0] : 'G'}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{fb.user?.name || 'Verified Guest'}</span>
                      <span className="text-[10px] text-slate-400">{new Date(fb.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{fb.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{fb.review_text}"
                </p>

                {fb.staff_response && (
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-teal-300">
                    <strong className="text-white block mb-0.5">Hotel Management Response:</strong>
                    {fb.staff_response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Share Your Stay Feedback</h3>
            
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${s <= rating ? 'fill-current' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Review</label>
              <textarea
                rows={4}
                required
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="How was the QR check-in and hotel experience?"
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submittingReview || !reviewText.trim()}
                className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
