import httpx
import time

def verify():
    print("Testing backend endpoints against SQLite database...")
    from app.main import app
    from fastapi.testclient import TestClient

    client = TestClient(app)

    # 1. Health check
    r = client.get("/api/health")
    assert r.status_code == 200, f"Healthcheck failed: {r.text}"
    print("[PASS] GET /api/health ->", r.json())

    # 2. Login as demo guest
    r = client.post("/api/auth/login", json={"email": "guest@scanstay.com", "password": "guest123"})
    assert r.status_code == 200, f"Login failed: {r.text}"
    guest_token = r.json()["access_token"]
    print("[PASS] POST /api/auth/login (Guest) -> Token obtained")

    # 3. List Hotels
    r = client.get("/api/hotels")
    assert r.status_code == 200 and len(r.json()) >= 6, f"Hotels list failed: {r.text}"
    hotels = r.json()
    print(f"[PASS] GET /api/hotels -> Loaded {len(hotels)} hotels")

    # 4. Get My Bookings
    headers = {"Authorization": f"Bearer {guest_token}"}
    r = client.get("/api/bookings/my-bookings", headers=headers)
    assert r.status_code == 200, f"My bookings failed: {r.text}"
    bookings = r.json()
    print(f"[PASS] GET /api/bookings/my-bookings -> Found {len(bookings)} bookings")
    active_booking = bookings[0]
    qr_token = active_booking["qr_pass"]["qr_token"]

    # 5. Validate QR Pass as Reception
    r = client.post("/api/qr/validate", json={"token": qr_token, "action": "check_in", "scanned_by": "Test Kiosk"})
    assert r.status_code == 200 and r.json()["valid"] == True, f"QR validation failed: {r.text}"
    print("[PASS] POST /api/qr/validate -> Cryptographic HMAC Token Verified & Check-in executed")

    # 6. Simulate IoT Smart Key Door Unlock
    r = client.post("/api/qr/door-unlock", json={"booking_ref": active_booking["booking_ref"], "qr_token": qr_token})
    assert r.status_code == 200 and r.json()["status"] == "unlocked", f"Door unlock failed: {r.text}"
    print("[PASS] POST /api/qr/door-unlock -> IoT Door Unlocked successfully")

    # 7. AI Concierge Chat
    r = client.post("/api/ai/chat", json={"message": "Suggest me a beachfront resort in Goa"})
    assert r.status_code == 200 and "Grand Azure" in r.json()["reply"], f"AI chat failed: {r.text}"
    print("[PASS] POST /api/ai/chat -> AI StayBot reply received successfully")

    # 8. Admin Analytics
    r = client.post("/api/auth/login", json={"email": "admin@scanstay.com", "password": "admin123"})
    admin_token = r.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    r = client.get("/api/admin/analytics", headers=admin_headers)
    assert r.status_code == 200, f"Admin analytics failed: {r.text}"
    print("[PASS] GET /api/admin/analytics ->", f"Total Bookings: {r.json()['total_bookings']}, Occupancy: {r.json()['occupancy_rate']}%")

    print("\n ALL SYSTEM VERIFICATION CHECKS PASSED (100% OPERATIONAL)!")

if __name__ == "__main__":
    verify()
