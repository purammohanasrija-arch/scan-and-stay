import {
  User, Hotel, HotelDetail, Room, Booking, Feedback, QRCodePass,
  InRoomOrder, NotificationItem, AuditLog, AdminAnalytics
} from '../types';

const BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('scan_stay_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return response.json();
}

export const api = {
  // --- Auth ---
  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async signup(data: { name: string; email: string; password: string; phone?: string }): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async googleLogin(name: string, email: string, avatar_url?: string): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${BASE_URL}/auth/google-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, avatar_url }),
    });
    return handleResponse(res);
  },

  async getProfile(): Promise<User> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    return handleResponse(res);
  },

  // --- Hotels ---
  async getHotels(params?: {
    search?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
    rating?: number;
    amenity?: string;
    featured?: boolean;
    sort_by?: string;
  }): Promise<Hotel[]> {
    const url = new URL(`${window.location.origin}${BASE_URL}/hotels`);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          url.searchParams.append(key, String(val));
        }
      });
    }
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getHotelById(id: number): Promise<HotelDetail> {
    const res = await fetch(`${BASE_URL}/hotels/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createHotel(data: Partial<Hotel>): Promise<Hotel> {
    const res = await fetch(`${BASE_URL}/hotels`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async updateHotel(id: number, data: Partial<Hotel>): Promise<Hotel> {
    const res = await fetch(`${BASE_URL}/hotels/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async deleteHotel(id: number): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/hotels/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getFeedbacks(hotelId: number): Promise<Feedback[]> {
    const res = await fetch(`${BASE_URL}/hotels/${hotelId}/feedbacks`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async submitFeedback(data: {
    hotel_id: number;
    booking_id: number;
    rating: number;
    cleanliness_rating: number;
    service_rating: number;
    location_rating: number;
    review_text: string;
  }): Promise<Feedback> {
    const res = await fetch(`${BASE_URL}/hotels/${data.hotel_id}/feedbacks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // --- Rooms ---
  async getRooms(hotelId?: number, status?: string): Promise<Room[]> {
    const url = new URL(`${window.location.origin}${BASE_URL}/rooms`);
    if (hotelId) url.searchParams.append('hotel_id', String(hotelId));
    if (status) url.searchParams.append('status', status);
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updateRoom(roomId: number, data: Partial<Room>): Promise<Room> {
    const res = await fetch(`${BASE_URL}/rooms/${roomId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // --- Bookings ---
  async createBooking(data: {
    hotel_id: number;
    room_id: number;
    check_in_date: string;
    check_out_date: string;
    guests_count: number;
    special_requests?: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    payment_method?: string;
  }): Promise<Booking> {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/bookings/my-bookings`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getAllBookings(status?: string, hotelId?: number): Promise<Booking[]> {
    const url = new URL(`${window.location.origin}${BASE_URL}/bookings/all`);
    if (status) url.searchParams.append('status', status);
    if (hotelId) url.searchParams.append('hotel_id', String(hotelId));
    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getBookingByRef(ref: string): Promise<Booking> {
    const res = await fetch(`${BASE_URL}/bookings/ref/${ref}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async updateBookingStatus(bookingId: number, data: { booking_status?: string; payment_status?: string; room_id?: number }): Promise<Booking> {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async cancelBooking(bookingId: number): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // --- QR & IoT Key Service ---
  async validateQR(token: string, action: string = 'check_in', scannedBy: string = 'Front Desk Terminal'): Promise<{
    valid: boolean;
    message: string;
    booking?: Booking;
    action_performed?: string;
  }> {
    const res = await fetch(`${BASE_URL}/qr/validate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token, action, scanned_by: scannedBy }),
    });
    return handleResponse(res);
  },

  async unlockDoor(booking_ref: string, qr_token: string): Promise<{
    status: string;
    room_number: string;
    room_type: string;
    message: string;
    timestamp: string;
  }> {
    const res = await fetch(`${BASE_URL}/qr/door-unlock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ booking_ref, qr_token }),
    });
    return handleResponse(res);
  },

  async createInRoomOrder(data: { booking_id: number; room_id: number; items: string; total_price: number; notes?: string }): Promise<InRoomOrder> {
    const res = await fetch(`${BASE_URL}/qr/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getInRoomOrders(bookingId: number): Promise<InRoomOrder[]> {
    const res = await fetch(`${BASE_URL}/qr/orders/${bookingId}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  // --- Payments & Invoicing ---
  async createPaymentOrder(amount: number): Promise<{ order_id: string; amount: number; currency: string; key_id: string; user: any }> {
    const res = await fetch(`${BASE_URL}/payments/create-order?amount=${amount}`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getInvoice(bookingId: number): Promise<any> {
    const res = await fetch(`${BASE_URL}/payments/invoice/${bookingId}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  // --- Notifications ---
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${BASE_URL}/notifications`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async markNotificationRead(id: number): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    const res = await fetch(`${BASE_URL}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // --- AI Concierge ---
  async chatWithAI(message: string, history?: any[]): Promise<{ reply: string; suggested_actions?: string[]; recommended_hotels?: number[] }> {
    const res = await fetch(`${BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message, history }),
    });
    return handleResponse(res);
  },

  async getDynamicPricing(): Promise<any> {
    const res = await fetch(`${BASE_URL}/ai/pricing-insights`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  // --- Admin Analytics & Logs ---
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch(`${BASE_URL}/admin/analytics`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async getAuditLogs(suspiciousOnly: boolean = false): Promise<AuditLog[]> {
    const res = await fetch(`${BASE_URL}/admin/audit-logs?suspicious_only=${suspiciousOnly}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getStaffMembers(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/admin/staff`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async createStaffMember(data: any): Promise<User> {
    const res = await fetch(`${BASE_URL}/admin/staff`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getGuests(): Promise<User[]> {
    const res = await fetch(`${BASE_URL}/admin/guests`, { headers: getAuthHeaders() });
    return handleResponse(res);
  }
};
