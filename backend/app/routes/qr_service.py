import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import (
    Booking, QRCodePass, Room, AuditLog, InRoomOrder, User
)
from app.schemas.schemas import (
    QRValidateRequest, QRValidateResponse, DoorUnlockRequest, InRoomOrderCreate, InRoomOrderOut, BookingOut
)
from app.core.security import verify_signed_qr_payload
from app.routes.auth import get_current_user, get_current_staff

router = APIRouter(prefix="/qr", tags=["QR Management & Digital Keycard"])

@router.post("/validate", response_model=QRValidateResponse)
def validate_qr_token(
    request: QRValidateRequest,
    db: Session = Depends(get_db)
):
    """
    Validates scanned QR pass at Reception or Hotel Scanner.
    Performs cryptographic HMAC-SHA256 signature verification.
    Prevents replay attacks, checks pass expiry, and executes check-in/out.
    """
    is_valid, payload, error_msg = verify_signed_qr_payload(request.token)
    
    if not is_valid or not payload:
        # Log suspicious scan attempt
        audit = AuditLog(
            action="QR_SCAN_FAIL",
            ip_address="127.0.0.1",
            device_info=request.scanned_by or "Front Desk Scanner",
            is_suspicious=True,
            details=json.dumps({"error": error_msg, "raw_token_preview": request.token[:30]})
        )
        db.add(audit)
        db.commit()
        return QRValidateResponse(
            valid=False,
            message=f"Access Denied: {error_msg}",
            booking=None,
            action_performed=None
        )

    # Lookup booking by reference
    booking_ref = payload.get("ref")
    booking = db.query(Booking).filter(Booking.booking_ref == booking_ref).first()
    
    if not booking:
        return QRValidateResponse(
            valid=False,
            message="Access Denied: Reservation records not found",
            booking=None
        )

    if not booking.qr_pass or not booking.qr_pass.is_active:
        return QRValidateResponse(
            valid=False,
            message="Access Denied: This QR Pass has been deactivated or cancelled",
            booking=BookingOut.from_orm(booking)
        )

    # Perform action
    action_performed = request.action or "info"
    if request.action == "check_in":
        if booking.booking_status == "checked_in":
            msg = f"Guest {booking.guest_name} is already checked in to Room {booking.room.room_number}."
        elif booking.booking_status == "checked_out":
            msg = f"Reservation has already completed check-out on {booking.qr_pass.check_out_timestamp}."
        else:
            booking.booking_status = "checked_in"
            booking.qr_pass.check_in_timestamp = datetime.utcnow()
            booking.qr_pass.access_count += 1
            booking.qr_pass.last_scanned_by = request.scanned_by
            booking.room.status = "occupied"
            msg = f"Check-In Verified! Welcome {booking.guest_name} to Room {booking.room.room_number}."
    elif request.action == "check_out":
        booking.booking_status = "checked_out"
        booking.qr_pass.check_out_timestamp = datetime.utcnow()
        booking.qr_pass.is_active = False
        booking.room.status = "available"
        msg = f"Check-Out Complete. Thank you for staying at {booking.hotel.name}!"
    else:
        booking.qr_pass.access_count += 1
        msg = f"QR Validated. Room {booking.room.room_number} | Guest: {booking.guest_name} | Status: {booking.booking_status.upper()}"

    # Log successful audit
    audit = AuditLog(
        user_id=booking.user_id,
        user_email=booking.guest_email,
        action=f"QR_SCAN_{action_performed.upper()}",
        ip_address="127.0.0.1",
        device_info=request.scanned_by or "Kiosk Terminal",
        is_suspicious=False,
        details=json.dumps({"booking_ref": booking.booking_ref, "room": booking.room.room_number})
    )
    db.add(audit)
    db.commit()
    db.refresh(booking)

    return QRValidateResponse(
        valid=True,
        message=msg,
        booking=BookingOut.from_orm(booking),
        action_performed=action_performed
    )

@router.post("/door-unlock")
def simulate_smart_door_unlock(
    request: DoorUnlockRequest,
    db: Session = Depends(get_db)
):
    """
    Simulates contactless BLE/NFC IoT door lock opening using signed digital key.
    """
    is_valid, payload, error_msg = verify_signed_qr_payload(request.qr_token)
    if not is_valid or not payload:
        raise HTTPException(status_code=403, detail=f"Digital key rejected: {error_msg}")

    booking = db.query(Booking).filter(Booking.booking_ref == request.booking_ref).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found")

    if booking.booking_status not in ["confirmed", "checked_in"]:
        raise HTTPException(status_code=403, detail=f"Door lock locked: Status is '{booking.booking_status}'")

    if booking.qr_pass:
        booking.qr_pass.access_count += 1

    audit = AuditLog(
        user_id=booking.user_id,
        user_email=booking.guest_email,
        action="IOT_DOOR_UNLOCK",
        ip_address="127.0.0.1",
        device_info=request.device_id or "Digital Key App",
        is_suspicious=False,
        details=json.dumps({"room_number": booking.room.room_number, "hotel": booking.hotel.name})
    )
    db.add(audit)
    db.commit()

    return {
        "status": "unlocked",
        "room_number": booking.room.room_number,
        "room_type": booking.room.room_type,
        "message": f"Room {booking.room.room_number} unlocked successfully! Green LED activated.",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/orders", response_model=InRoomOrderOut)
def create_in_room_order(
    order_in: InRoomOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == order_in.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    new_order = InRoomOrder(
        booking_id=order_in.booking_id,
        room_id=order_in.room_id,
        items=order_in.items,
        total_price=order_in.total_price,
        notes=order_in.notes,
        status="ordered"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/orders/{booking_id}", response_model=List[InRoomOrderOut])
def get_in_room_orders(
    booking_id: int,
    db: Session = Depends(get_db)
):
    orders = db.query(InRoomOrder).filter(InRoomOrder.booking_id == booking_id).order_by(InRoomOrder.created_at.desc()).all()
    return orders
