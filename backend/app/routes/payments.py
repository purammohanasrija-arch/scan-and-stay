import json
import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Payment, Booking, User
from app.routes.auth import get_current_user, get_current_staff

router = APIRouter(prefix="/payments", tags=["Payments & Invoicing"])

@router.post("/create-order")
def create_payment_order(
    amount: float,
    currency: str = "INR",
    current_user: User = Depends(get_current_user)
):
    """
    Simulates creation of an order in Razorpay / Stripe gateway.
    Returns order_id and razorpay key.
    """
    order_id = f"order_scan_{uuid.uuid4().hex[:14]}"
    return {
        "order_id": order_id,
        "amount": amount,
        "currency": currency,
        "key_id": "rzp_test_scan_and_stay_demo",
        "user": {
            "name": current_user.name,
            "email": current_user.email,
            "phone": current_user.phone
        }
    }

@router.get("/invoice/{booking_id}")
def get_booking_invoice(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role == "guest" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized to view this invoice")

    payment = db.query(Payment).filter(Payment.booking_id == booking.id).first()

    return {
        "invoice_number": f"INV-2026-{booking.id:05d}",
        "date": booking.created_at.strftime("%B %d, %Y"),
        "booking_ref": booking.booking_ref,
        "hotel": {
            "name": booking.hotel.name,
            "address": booking.hotel.address,
            "city": booking.hotel.city,
            "state": booking.hotel.state,
            "gstin": "27AAACS1234F1Z8"
        },
        "guest": {
            "name": booking.guest_name,
            "email": booking.guest_email,
            "phone": booking.guest_phone
        },
        "stay_details": {
            "room_type": booking.room.room_type,
            "room_number": booking.room.room_number,
            "check_in": booking.check_in_date,
            "check_out": booking.check_out_date,
            "nights": booking.nights,
            "guests": booking.guests_count
        },
        "breakdown": {
            "room_rate": booking.room.price_per_night,
            "subtotal": booking.room.price_per_night * booking.nights,
            "discount": booking.discount_amount,
            "tax_cgst": round(booking.tax_amount / 2, 2),
            "tax_sgst": round(booking.tax_amount / 2, 2),
            "total_tax": booking.tax_amount,
            "grand_total": booking.total_amount
        },
        "payment": {
            "status": booking.payment_status,
            "method": payment.payment_method if payment else "Card / Online",
            "transaction_ref": payment.transaction_ref if payment else "N/A"
        }
    }

@router.get("/transactions")
def get_user_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role in ["admin", "receptionist"]:
        payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    else:
        payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(Payment.created_at.desc()).all()
    
    return [
        {
            "id": p.id,
            "booking_id": p.booking_id,
            "amount": p.amount,
            "currency": p.currency,
            "payment_method": p.payment_method,
            "transaction_ref": p.transaction_ref,
            "status": p.status,
            "created_at": p.created_at
        }
        for p in payments
    ]
