from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: Optional[str] = "guest"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    token: Optional[str] = None
    email: EmailStr
    name: str
    avatar_url: Optional[str] = None

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str

class UserOut(UserBase):
    id: int
    loyalty_points: int
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# --- Hotel Schemas ---
class HotelBase(BaseModel):
    name: str
    city: str
    state: Optional[str] = "India"
    country: Optional[str] = "India"
    address: str
    latitude: float
    longitude: float
    rating: Optional[float] = 4.5
    review_count: Optional[int] = 0
    description: str
    cover_image: str
    gallery_images: Optional[str] = "[]"
    amenities: Optional[str] = "[]"
    featured: Optional[bool] = False
    base_price: Optional[float] = 2499.0

class HotelCreate(HotelBase):
    pass

class HotelUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    gallery_images: Optional[str] = None
    amenities: Optional[str] = None
    featured: Optional[bool] = None
    base_price: Optional[float] = None
    rating: Optional[float] = None

class HotelOut(HotelBase):
    id: int
    slug: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Room Schemas ---
class RoomBase(BaseModel):
    hotel_id: int
    room_number: str
    room_type: str
    price_per_night: float
    capacity: Optional[int] = 2
    bed_type: Optional[str] = "King Bed"
    has_ac: Optional[bool] = True
    has_wifi: Optional[bool] = True
    floor_number: Optional[int] = 1
    description: Optional[str] = None
    amenities: Optional[str] = "[]"
    images: Optional[str] = "[]"
    status: Optional[str] = "available"

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    price_per_night: Optional[float] = None
    capacity: Optional[int] = None
    status: Optional[str] = None
    amenities: Optional[str] = None
    images: Optional[str] = None

class RoomOut(RoomBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class HotelDetailOut(HotelOut):
    rooms: List[RoomOut] = []

# --- Booking Schemas ---
class BookingCreate(BaseModel):
    hotel_id: int
    room_id: int
    check_in_date: str
    check_out_date: str
    guests_count: int = 1
    special_requests: Optional[str] = None
    guest_name: str
    guest_email: EmailStr
    guest_phone: str
    payment_method: Optional[str] = "card"

class QRCodePassOut(BaseModel):
    id: int
    booking_id: int
    qr_token: str
    qr_code_image: Optional[str] = None
    is_active: bool
    check_in_timestamp: Optional[datetime] = None
    check_out_timestamp: Optional[datetime] = None
    access_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class BookingOut(BaseModel):
    id: int
    booking_ref: str
    user_id: int
    hotel_id: int
    room_id: int
    check_in_date: str
    check_out_date: str
    nights: int
    guests_count: int
    total_amount: float
    discount_amount: float
    tax_amount: float
    payment_status: str
    booking_status: str
    special_requests: Optional[str] = None
    guest_name: str
    guest_email: str
    guest_phone: str
    created_at: datetime
    hotel: Optional[HotelOut] = None
    room: Optional[RoomOut] = None
    qr_pass: Optional[QRCodePassOut] = None

    class Config:
        from_attributes = True

class BookingStatusUpdate(BaseModel):
    booking_status: Optional[str] = None
    payment_status: Optional[str] = None
    room_id: Optional[int] = None

# --- QR & IoT Door Schemas ---
class QRValidateRequest(BaseModel):
    token: str
    scanned_by: Optional[str] = "Reception Terminal 1"
    action: Optional[str] = "check_in" # check_in, check_out, room_access, info

class QRValidateResponse(BaseModel):
    valid: bool
    message: str
    booking: Optional[BookingOut] = None
    action_performed: Optional[str] = None
    timestamp: datetime = datetime.utcnow()

class DoorUnlockRequest(BaseModel):
    booking_ref: str
    qr_token: str
    device_id: Optional[str] = "mobile-app-nfc"

# --- In-room Orders ---
class InRoomOrderCreate(BaseModel):
    booking_id: int
    room_id: int
    items: str # JSON list
    total_price: float
    notes: Optional[str] = None

class InRoomOrderOut(BaseModel):
    id: int
    booking_id: int
    room_id: int
    items: str
    total_price: float
    notes: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    hotel_id: int
    booking_id: int
    rating: float
    cleanliness_rating: Optional[float] = 5.0
    service_rating: Optional[float] = 5.0
    location_rating: Optional[float] = 5.0
    review_text: str

class FeedbackOut(BaseModel):
    id: int
    user_id: int
    hotel_id: int
    booking_id: int
    rating: float
    cleanliness_rating: float
    service_rating: float
    location_rating: float
    review_text: str
    sentiment: str
    staff_response: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None

    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    channel: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# --- Audit Logs ---
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    ip_address: str
    device_info: str
    is_suspicious: bool
    details: str
    timestamp: datetime

    class Config:
        from_attributes = True

# --- AI & Analytics ---
class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []
    context: Optional[dict] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    recommended_hotels: Optional[List[int]] = []

class AdminAnalyticsResponse(BaseModel):
    total_bookings: int
    total_revenue: float
    occupancy_rate: float
    active_guests: int
    available_rooms: int
    total_rooms: int
    monthly_revenue: List[dict]
    recent_bookings: List[BookingOut]
    fraud_alerts: int
