export type UserRole = 'guest' | 'admin' | 'receptionist' | 'housekeeping';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  loyalty_points: number;
  avatar_url?: string;
  created_at: string;
}

export interface Hotel {
  id: number;
  name: string;
  slug: string;
  city: string;
  state: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
  description: string;
  cover_image: string;
  gallery_images: string; // JSON string or parsed array
  amenities: string;      // JSON string or parsed array
  featured: boolean;
  base_price: number;
  created_at: string;
}

export interface Room {
  id: number;
  hotel_id: number;
  room_number: string;
  room_type: string;
  price_per_night: number;
  capacity: number;
  bed_type: string;
  has_ac: boolean;
  has_wifi: boolean;
  floor_number: number;
  description?: string;
  amenities: string;
  images: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  created_at: string;
}

export interface HotelDetail extends Hotel {
  rooms: Room[];
}

export interface QRCodePass {
  id: number;
  booking_id: number;
  qr_token: string;
  qr_code_image?: string;
  is_active: boolean;
  check_in_timestamp?: string;
  check_out_timestamp?: string;
  access_count: number;
  last_scanned_by?: string;
  created_at: string;
}

export interface Booking {
  id: number;
  booking_ref: string;
  user_id: number;
  hotel_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  guests_count: number;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  booking_status: 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  special_requests?: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  created_at: string;
  hotel?: Hotel;
  room?: Room;
  qr_pass?: QRCodePass;
}

export interface Feedback {
  id: number;
  user_id: number;
  hotel_id: number;
  booking_id: number;
  rating: number;
  cleanliness_rating: number;
  service_rating: number;
  location_rating: number;
  review_text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  staff_response?: string;
  created_at: string;
  user?: User;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  channel: 'in_app' | 'email' | 'whatsapp' | 'sms';
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  user_email?: string;
  action: string;
  ip_address: string;
  device_info: string;
  is_suspicious: boolean;
  details: string;
  timestamp: string;
}

export interface InRoomOrder {
  id: number;
  booking_id: number;
  room_id: number;
  items: string;
  total_price: number;
  notes?: string;
  status: 'ordered' | 'preparing' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface AdminAnalytics {
  total_bookings: number;
  total_revenue: number;
  occupancy_rate: number;
  active_guests: number;
  available_rooms: number;
  total_rooms: number;
  monthly_revenue: Array<{ month: string; revenue: number; bookings: number }>;
  recent_bookings: Booking[];
  fraud_alerts: number;
}
