import json
import io
import base64
import qrcode
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.models import (
    User, Hotel, Room, Booking, Payment, QRCodePass, Feedback, AuditLog, Notification
)
from app.core.security import get_password_hash, generate_signed_qr_payload

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

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).first():
        print("Database already has data. Skipping initial seeding.")
        return

    print("[SEED] Seeding database with initial hotels, rooms, users, and bookings...")

    # 1. Create Users
    admin_user = User(
        name="Vikram Malhotra (Admin)",
        email="admin@scanstay.com",
        hashed_password=get_password_hash("admin123"),
        phone="+91 98765 43210",
        role="admin",
        loyalty_points=1200,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )

    reception_user = User(
        name="Pooja Sharma (Front Desk)",
        email="reception@scanstay.com",
        hashed_password=get_password_hash("reception123"),
        phone="+91 98111 22334",
        role="receptionist",
        loyalty_points=500,
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    )

    guest_user1 = User(
        name="Rahul Verma",
        email="guest@scanstay.com",
        hashed_password=get_password_hash("guest123"),
        phone="+91 98222 33445",
        role="guest",
        loyalty_points=650,
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    )

    guest_user2 = User(
        name="Ananya Roy",
        email="ananya@scanstay.com",
        hashed_password=get_password_hash("guest123"),
        phone="+91 97333 44556",
        role="guest",
        loyalty_points=320,
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
    )

    db.add_all([admin_user, reception_user, guest_user1, guest_user2])
    db.commit()

    # 2. Create Hotels
    hotels_data = [
        {
            "name": "The Grand Azure Resort & Spa",
            "slug": "the-grand-azure-resort-spa-goa",
            "city": "Goa",
            "state": "Goa",
            "country": "India",
            "address": "Calangute-Baga Road, North Goa, 403516",
            "latitude": 15.5435,
            "longitude": 73.7554,
            "rating": 4.9,
            "review_count": 348,
            "description": "Experience ultra-luxury seaside living at The Grand Azure. Featuring beachfront infinity pools, signature Ayurvedic spas, Michelin-inspired dining, and high-speed contactless smart room controls.",
            "cover_image": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200&auto=format&fit=crop&q=80",
            "gallery_images": json.dumps([
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80"
            ]),
            "amenities": json.dumps(["Beachfront", "Infinity Pool", "Ayurvedic Spa", "Ultra High-speed WiFi", "Smart Room IoT", "Airport Shuttle", "24/7 Room Service", "Gym & Fitness"]),
            "featured": True,
            "base_price": 5499.0
        },
        {
            "name": "The Heritage Palace & Haveli",
            "slug": "the-heritage-palace-haveli-jaipur",
            "city": "Jaipur",
            "state": "Rajasthan",
            "country": "India",
            "address": "Civil Lines, Near Hawa Mahal, Jaipur, 302006",
            "latitude": 26.9124,
            "longitude": 75.7873,
            "rating": 4.8,
            "review_count": 290,
            "description": "Step into royal grandeur in this restored 18th-century Rajput palace. Handcrafted frescoes, royal courtyards, live folk performances, and smart digital keys blending historic luxury with modern tech.",
            "cover_image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&auto=format&fit=crop&q=80",
            "gallery_images": json.dumps([
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80"
            ]),
            "amenities": json.dumps(["Heritage Courtyard", "Royal Banquet", "Smart QR Keycard", "Free High-Speed WiFi", "Fine Dining", "Swimming Pool", "Spa & Wellness"]),
            "featured": True,
            "base_price": 4899.0
        },
        {
            "name": "Silicon Skyline Tech Hotel",
            "slug": "silicon-skyline-tech-hotel-bengaluru",
            "city": "Bengaluru",
            "state": "Karnataka",
            "country": "India",
            "address": "100ft Road, Indiranagar, Bengaluru, 560038",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "rating": 4.7,
            "review_count": 412,
            "description": "Designed for tech entrepreneurs, creators, and business visionaries. Automated self check-in pods, 1Gbps fiber internet, ergonomic workspaces, smart mood lighting, and rooftop cocktail lounge.",
            "cover_image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
            "gallery_images": json.dumps([
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1000&auto=format&fit=crop&q=80"
            ]),
            "amenities": json.dumps(["1Gbps Fiber WiFi", "Ergonomic Workspace", "Automated Check-in", "EV Charging", "Rooftop Lounge", "Meeting Pods", "Smart TV & Soundbar"]),
            "featured": True,
            "base_price": 3899.0
        },
        {
            "name": "Alpine Mist Cloud Chalet",
            "slug": "alpine-mist-cloud-chalet-manali",
            "city": "Manali",
            "state": "Himachal Pradesh",
            "country": "India",
            "address": "Solang Valley Road, Manali, 175131",
            "latitude": 32.2396,
            "longitude": 77.1887,
            "rating": 4.9,
            "review_count": 215,
            "description": "Nestled among snow-dusted cedar pines and panoramic Himalayan peaks. Heated pine wood chalets, floor-to-ceiling panoramic glass windows, crackling stone fireplaces, and bonfire nights.",
            "cover_image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
            "gallery_images": json.dumps([
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1000&auto=format&fit=crop&q=80"
            ]),
            "amenities": json.dumps(["Mountain View", "Fireplace", "Underfloor Heating", "Hot Tub Jacuzzi", "High-speed WiFi", "Ski Storage", "Guided Treks"]),
            "featured": False,
            "base_price": 4299.0
        },
        {
            "name": "Oasis Palms Waterfront Villa",
            "slug": "oasis-palms-waterfront-villa-udaipur",
            "city": "Udaipur",
            "state": "Rajasthan",
            "country": "India",
            "address": "Lake Pichola Promenade, Udaipur, 313001",
            "latitude": 24.5854,
            "longitude": 73.7125,
            "rating": 4.9,
            "review_count": 184,
            "description": "Overlooking the tranquil waters of Lake Pichola and the illuminated City Palace. Private jharokha balconies, candlelit lakeside dining, and seamless QR-managed room concierge.",
            "cover_image": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&auto=format&fit=crop&q=80",
            "gallery_images": json.dumps([
                "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1000&auto=format&fit=crop&q=80"
            ]),
            "amenities": json.dumps(["Lake View Balcony", "Private Boat Transfer", "Infinity Plunge Pool", "High-speed WiFi", "Fine Dining", "Air Conditioned"]),
            "featured": True,
            "base_price": 6299.0
        },
        {
            "name": "The Metropolis Horizon Tower",
            "slug": "the-metropolis-horizon-tower-mumbai",
            "city": "Mumbai",
            "state": "Maharashtra",
            "country": "India",
            "address": "Marine Drive Promenade, Churchgate, Mumbai, 400020",
            "latitude": 18.9322,
            "longitude": 72.8264,
            "rating": 4.8,
            "review_count": 520,
            "description": "Soaring above the Arabian Sea and the Queens Necklace skyline. Contemporary urban luxury with biometric access, high-floor executive suites, sky bar, and 24-hour butler assistance.",
            "cover_image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&auto=format&fit=crop&q=80",
            "gallery_images": json.dumps([
                "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1000&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&auto=format&fit=crop&q=80"
            ]),
            "amenities": json.dumps(["Sea View", "Rooftop Sky Bar", "Infinity Pool", "Express QR Check-in", "Executive Lounge", "Gym & Sauna", "Valet Parking"]),
            "featured": False,
            "base_price": 5899.0
        }
    ]

    hotel_instances = []
    for h_data in hotels_data:
        h = Hotel(**h_data)
        db.add(h)
        hotel_instances.append(h)
    
    db.commit()

    # 3. Create Rooms for each hotel
    room_templates = [
        {"type": "Deluxe King Room", "price_mult": 1.0, "cap": 2, "bed": "1 King Bed", "floor": 2, "img": "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80"},
        {"type": "Executive Sea/City View Suite", "price_mult": 1.45, "cap": 3, "bed": "1 King + 1 Sofa Bed", "floor": 4, "img": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80"},
        {"type": "Presidential Royal Suite", "price_mult": 2.2, "cap": 4, "bed": "2 King Beds", "floor": 7, "img": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&auto=format&fit=crop&q=80"},
        {"type": "Premium Smart Studio", "price_mult": 0.85, "cap": 2, "bed": "Queen Bed", "floor": 1, "img": "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop&q=80"}
    ]

    all_rooms = []
    for h_idx, hotel in enumerate(hotel_instances):
        for r_idx, r_tpl in enumerate(room_templates):
            room_num = f"{h_idx+1}0{r_idx+1}"
            room = Room(
                hotel_id=hotel.id,
                room_number=room_num,
                room_type=r_tpl["type"],
                price_per_night=round(hotel.base_price * r_tpl["price_mult"]),
                capacity=r_tpl["cap"],
                bed_type=r_tpl["bed"],
                has_ac=True,
                has_wifi=True,
                floor_number=r_tpl["floor"],
                description=f"Spacious and sunlit {r_tpl['type']} located on Floor {r_tpl['floor']}. Offers ultra-comfort bedding, smart climate control, 55-inch 4K TV, rainfall shower, and contactless QR amenities.",
                amenities=json.dumps(["Smart Climate Control", "Free High-Speed WiFi", "Mini Bar", "Espresso Machine", "Rain Shower", "4K Smart TV", "Electronic Safe"]),
                images=json.dumps([r_tpl["img"], hotel.cover_image]),
                status="available"
            )
            db.add(room)
            all_rooms.append(room)

    db.commit()

    # 4. Create Active Demo Bookings with cryptographically signed QR Passes
    hotel1 = hotel_instances[0]
    room1 = all_rooms[0]  # Grand Azure Deluxe King Room

    today_str = datetime.utcnow().strftime("%Y-%m-%d")
    checkout_str = (datetime.utcnow() + timedelta(days=3)).strftime("%Y-%m-%d")
    booking_ref = "SS-2026-8921"

    booking1 = Booking(
        booking_ref=booking_ref,
        user_id=guest_user1.id,
        hotel_id=hotel1.id,
        room_id=room1.id,
        check_in_date=today_str,
        check_out_date=checkout_str,
        nights=3,
        guests_count=2,
        total_amount=room1.price_per_night * 3,
        discount_amount=500.0,
        tax_amount=round(room1.price_per_night * 3 * 0.12),
        payment_status="paid",
        booking_status="confirmed",
        special_requests="High floor with beach view and quiet room please.",
        guest_name=guest_user1.name,
        guest_email=guest_user1.email,
        guest_phone=guest_user1.phone
    )
    db.add(booking1)
    db.commit()

    # Payment record
    payment1 = Payment(
        booking_id=booking1.id,
        user_id=guest_user1.id,
        amount=booking1.total_amount,
        payment_method="card",
        transaction_ref="TXN-PAY-8891024-RZP",
        gateway_response=json.dumps({"gateway": "Razorpay Simulated", "status": "captured", "card_network": "Visa Platinum"}),
        status="success"
    )
    db.add(payment1)

    # Generate cryptographic QR token and QR base64 image
    qr_data = generate_signed_qr_payload(
        booking_ref=booking1.booking_ref,
        user_id=booking1.user_id,
        room_id=booking1.room_id,
        hotel_id=booking1.hotel_id,
        check_in=booking1.check_in_date,
        check_out=booking1.check_out_date
    )
    qr_image = generate_qr_base64_image(qr_data["token"])

    qr_pass1 = QRCodePass(
        booking_id=booking1.id,
        qr_token=qr_data["token"],
        qr_code_image=qr_image,
        is_active=True,
        access_count=0
    )
    db.add(qr_pass1)

    # 5. Create Sample Feedbacks
    feedback1 = Feedback(
        user_id=guest_user1.id,
        hotel_id=hotel1.id,
        booking_id=booking1.id,
        rating=5.0,
        cleanliness_rating=5.0,
        service_rating=5.0,
        location_rating=5.0,
        review_text="Absolute perfection! The QR check-in took literally 5 seconds at the counter and our room door unlocked smoothly with the digital pass. Highly recommended!",
        sentiment="positive",
        staff_response="Thank you Rahul! We are delighted to hear you enjoyed the smart contactless experience."
    )
    db.add(feedback1)

    # 6. Create Notifications
    notif1 = Notification(
        user_id=guest_user1.id,
        title="Booking Confirmed & QR Pass Ready!",
        message=f"Your stay at {hotel1.name} (Ref: {booking1.booking_ref}) is confirmed. Your digital QR pass is ready for check-in.",
        channel="whatsapp",
        type="booking_confirmed",
        is_read=False
    )
    notif2 = Notification(
        user_id=guest_user1.id,
        title="Payment of ₹16,497 Received",
        message="Payment processed successfully via Razorpay. Your tax invoice is available for download.",
        channel="email",
        type="payment_received",
        is_read=True
    )
    db.add_all([notif1, notif2])

    # 7. Audit Logs
    audit1 = AuditLog(
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="SYSTEM_INIT",
        ip_address="127.0.0.1",
        device_info="Server Lifespan Worker",
        is_suspicious=False,
        details=json.dumps({"msg": "Scan & Stay database initialized and seeded successfully."})
    )
    audit2 = AuditLog(
        user_id=guest_user1.id,
        user_email=guest_user1.email,
        action="LOGIN_SUCCESS",
        ip_address="192.168.1.45",
        device_info="Chrome 124 / Windows",
        is_suspicious=False,
        details=json.dumps({"auth_method": "password_jwt"})
    )
    db.add_all([audit1, audit2])

    db.commit()
    print("[SEED] Database seeding complete successfully!")
