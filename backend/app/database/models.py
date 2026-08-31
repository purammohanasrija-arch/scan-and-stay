from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(20), default="guest", nullable=False)  # guest, admin, receptionist, housekeeping
    loyalty_points = Column(Integer, default=100)
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), unique=True, index=True)
    city = Column(String(100), nullable=False)
    state = Column(String(100), default="India")
    country = Column(String(100), default="India")
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    description = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=False)
    gallery_images = Column(Text, default="[]")  # JSON encoded list of URLs
    amenities = Column(Text, default="[]")       # JSON encoded list: ['WiFi', 'Pool', 'Spa', 'Gym', 'AC']
    featured = Column(Boolean, default=False)
    base_price = Column(Float, default=2499.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="hotel", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="hotel", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_number = Column(String(20), nullable=False)
    room_type = Column(String(50), nullable=False)  # Standard, Deluxe, Executive Suite, Presidential Suite
    price_per_night = Column(Float, nullable=False)
    capacity = Column(Integer, default=2)
    bed_type = Column(String(50), default="King Size Bed")
    has_ac = Column(Boolean, default=True)
    has_wifi = Column(Boolean, default=True)
    floor_number = Column(Integer, default=1)
    description = Column(Text, nullable=True)
    amenities = Column(Text, default="[]")  # JSON encoded list
    images = Column(Text, default="[]")     # JSON encoded list
    status = Column(String(20), default="available")  # available, occupied, maintenance, cleaning
    created_at = Column(DateTime, default=datetime.utcnow)

    hotel = relationship("Hotel", back_populates="rooms")
    bookings = relationship("Booking", back_populates="room")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    booking_ref = Column(String(50), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    check_in_date = Column(String(20), nullable=False)   # YYYY-MM-DD
    check_out_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    nights = Column(Integer, default=1)
    guests_count = Column(Integer, default=1)
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    payment_status = Column(String(20), default="pending")  # pending, paid, refunded, failed
    booking_status = Column(String(20), default="confirmed") # confirmed, checked_in, checked_out, cancelled
    special_requests = Column(Text, nullable=True)
    guest_name = Column(String(100), nullable=False)
    guest_email = Column(String(120), nullable=False)
    guest_phone = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    hotel = relationship("Hotel", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")
    qr_pass = relationship("QRCodePass", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="booking", cascade="all, delete-orphan")
    in_room_orders = relationship("InRoomOrder", back_populates="booking", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    payment_method = Column(String(50), default="card")  # card, upi, netbanking, wallet
    transaction_ref = Column(String(100), unique=True, index=True, nullable=False)
    gateway_response = Column(Text, default="{}")        # JSON metadata
    status = Column(String(20), default="success")       # success, refunded, failed
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="payments")


class QRCodePass(Base):
    __tablename__ = "qr_passes"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), unique=True, nullable=False)
    qr_token = Column(Text, nullable=False)              # Signed base64 token string
    qr_code_image = Column(Text, nullable=True)          # Base64 encoded PNG image string
    is_active = Column(Boolean, default=True)
    check_in_timestamp = Column(DateTime, nullable=True)
    check_out_timestamp = Column(DateTime, nullable=True)
    access_count = Column(Integer, default=0)
    last_scanned_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="qr_pass")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    rating = Column(Float, nullable=False)
    cleanliness_rating = Column(Float, default=5.0)
    service_rating = Column(Float, default=5.0)
    location_rating = Column(Float, default=5.0)
    review_text = Column(Text, nullable=False)
    sentiment = Column(String(20), default="positive") # positive, neutral, negative
    staff_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="feedbacks")
    hotel = relationship("Hotel", back_populates="feedbacks")
    booking = relationship("Booking", back_populates="feedbacks")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user_email = Column(String(120), nullable=True)
    action = Column(String(100), nullable=False)  # LOGIN_SUCCESS, LOGIN_FAILED, QR_SCAN_SUCCESS, QR_SCAN_FAIL, FRAUD_ALERT, ROOM_UNLOCK
    ip_address = Column(String(50), default="127.0.0.1")
    device_info = Column(String(255), default="Web Browser / Chrome")
    is_suspicious = Column(Boolean, default=False)
    details = Column(Text, default="{}")  # JSON metadata
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


class InRoomOrder(Base):
    __tablename__ = "in_room_orders"

    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    items = Column(Text, nullable=False)  # JSON list of order items
    total_price = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    status = Column(String(20), default="ordered") # ordered, preparing, delivered, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    booking = relationship("Booking", back_populates="in_room_orders")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    channel = Column(String(20), default="in_app") # in_app, email, whatsapp, sms
    type = Column(String(50), default="booking_confirmed") # booking_confirmed, qr_checkin, payment_received, checkout_reminder, promotion
    is_read = Column(Boolean, default=False)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
