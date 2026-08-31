import json
import uuid
import io
import base64
import qrcode
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import (
    Booking, Hotel, Room, User, Payment, QRCodePass, Notification, AuditLog
)
from app.schemas.schemas import (
    BookingCreate, BookingOut, BookingStatusUpdate
)
from app.routes.auth import get_current_user, get_current_staff
from app.core.security import generate_signed_qr_payload

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def generate_qr_base64_image(content: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(content)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode()

@router.post("", response_model=BookingOut)
def create_booking(
    booking_in: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    hotel = db.query(Hotel).filter(Hotel.id == booking_in.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    room = db.query(Room).filter(Room.id == booking_in.room_id, Room.hotel_id == hotel.id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Selected Room not found in this hotel")

    # Calculate nights
    try:
        cin = datetime.strptime(booking_in.check_in_date, "%Y-%m-%d")
        cout = datetime.strptime(booking_in.check_out_date, "%Y-%m-%d")
        nights = max(1, (cout - cin).days)
    except Exception:
        nights = 1

    room_total = room.price_per_night * nights
    tax_amount = round(room_total * 0.12, 2)
    discount_amount = 200.0 if current_user.loyalty_points >= 200 else 0.0
    total_amount = round(room_total + tax_amount - discount_amount, 2)

    # Generate unique booking reference (e.g. SS-2026-9281)
    ref_suffix = str(uuid.uuid4().int)[:4]
    booking_ref = f"SS-2026-{ref_suffix}"

    new_booking = Booking(
        booking_ref=booking_ref,
        user_id=current_user.id,
        hotel_id=hotel.id,
        room_id=room.id,
        check_in_date=booking_in.check_in_date,
        check_out_date=booking_in.check_out_date,
        nights=nights,
        guests_count=booking_in.guests_count,
        total_amount=total_amount,
        discount_amount=discount_amount,
        tax_amount=tax_amount,
        payment_status="paid",
        booking_status="confirmed",
        special_requests=booking_in.special_requests,
        guest_name=booking_in.guest_name,
        guest_email=booking_in.guest_email.lower(),
        guest_phone=booking_in.guest_phone
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # 1. Record simulated Payment
    txn_ref = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    payment = Payment(
        booking_id=new_booking.id,
        user_id=current_user.id,
        amount=total_amount,
        payment_method=booking_in.payment_method or "card",
        transaction_ref=txn_ref,
        gateway_response=json.dumps({
            "gateway": "Razorpay Secure Gateway",
            "method": booking_in.payment_method,
            "signature": f"rzp_sig_{uuid.uuid4().hex[:16]}"
        }),
        status="success"
    )
    db.add(payment)

    # 2. Generate Cryptographically Signed QR Pass
    qr_payload = generate_signed_qr_payload(
        booking_ref=new_booking.booking_ref,
        user_id=new_booking.user_id,
        room_id=new_booking.room_id,
        hotel_id=new_booking.hotel_id,
        check_in=new_booking.check_in_date,
        check_out=new_booking.check_out_date
    )
    qr_image = generate_qr_base64_image(qr_payload["token"])

    qr_pass = QRCodePass(
        booking_id=new_booking.id,
        qr_token=qr_payload["token"],
        qr_code_image=qr_image,
        is_active=True,
        access_count=0
    )
    db.add(qr_pass)

    # 3. Update User Loyalty Points (+50 points earned)
    current_user.loyalty_points = max(0, current_user.loyalty_points - int(discount_amount) + 50)

    # 4. Dispatch simulated Notifications
    notif_email = Notification(
        user_id=current_user.id,
        title=f"Booking Confirmed at {hotel.name}!",
        message=f"Booking {booking_ref} for Room {room.room_number} ({room.room_type}) is confirmed. Total paid: ₹{total_amount:,}. Your digital QR pass is ready.",
        channel="email",
        type="booking_confirmed"
    )
    notif_wa = Notification(
        user_id=current_user.id,
        title="WhatsApp Alert: Scan & Stay Digital Pass",
        message=f"Hi {booking_in.guest_name}, your QR Keycard is active for {hotel.name}. Scan at reception on arrival.",
        channel="whatsapp",
        type="booking_confirmed"
    )
    db.add_all([notif_email, notif_wa])

    # 5. Security Audit Log
    audit = AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="BOOKING_CREATED",
        ip_address="127.0.0.1",
        device_info="Scan & Stay Web App",
        is_suspicious=False,
        details=json.dumps({"booking_ref": booking_ref, "amount": total_amount, "hotel": hotel.name})
    )
    db.add(audit)

    db.commit()
    db.refresh(new_booking)
    return new_booking

@router.get("/my-bookings", response_model=List[BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).order_by(Booking.created_at.desc()).all()
    return bookings

@router.get("/all", response_model=List[BookingOut])
def get_all_bookings(
    status: Optional[str] = Query(None),
    hotel_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    staff: User = Depends(get_current_staff)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.booking_status == status)
    if hotel_id:
        query = query.filter(Booking.hotel_id == hotel_id)
    return query.order_by(Booking.created_at.desc()).all()

@router.get("/{booking_id}", response_model=BookingOut)
def get_booking_by_id(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role == "guest" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return booking

@router.get("/ref/{booking_ref}", response_model=BookingOut)
def get_booking_by_ref(
    booking_ref: str,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(Booking.booking_ref == booking_ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking reference not found")
    return booking

@router.patch("/{booking_id}/status", response_model=BookingOut)
def update_booking_status(
    booking_id: int,
    update_data: BookingStatusUpdate,
    db: Session = Depends(get_db),
    staff: User = Depends(get_current_staff)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if update_data.booking_status:
        booking.booking_status = update_data.booking_status
        if update_data.booking_status == "checked_in" and booking.qr_pass:
            booking.qr_pass.check_in_timestamp = datetime.utcnow()
        elif update_data.booking_status == "checked_out" and booking.qr_pass:
            booking.qr_pass.check_out_timestamp = datetime.utcnow()
            booking.qr_pass.is_active = False

    if update_data.payment_status:
        booking.payment_status = update_data.payment_status

    if update_data.room_id:
        booking.room_id = update_data.room_id

    db.commit()
    db.refresh(booking)
    return booking

@router.post("/{booking_id}/cancel")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == "guest" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if booking.booking_status in ["checked_in", "checked_out", "cancelled"]:
        raise HTTPException(status_code=400, detail=f"Cannot cancel booking with status '{booking.booking_status}'")

    booking.booking_status = "cancelled"
    booking.payment_status = "refunded"
    if booking.qr_pass:
        booking.qr_pass.is_active = False

    # Log refund
    refund_payment = Payment(
        booking_id=booking.id,
        user_id=booking.user_id,
        amount=booking.total_amount,
        payment_method="refund",
        transaction_ref=f"REFUND-{uuid.uuid4().hex[:10].upper()}",
        gateway_response=json.dumps({"status": "full_refund_processed"}),
        status="refunded"
    )
    db.add(refund_payment)

    notif = Notification(
        user_id=booking.user_id,
        title="Booking Cancelled & Refund Initiated",
        message=f"Your booking {booking.booking_ref} has been cancelled. Full refund of ₹{booking.total_amount:,} initiated to your original payment method.",
        channel="email",
        type="refund"
    )
    db.add(notif)

    db.commit()
    return {"message": "Booking successfully cancelled. Refund processed.", "booking_id": booking.id}
