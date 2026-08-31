# Scan & Stay 🏨✨
## Secure Smart Hotel Reservation & QR-Based Management System

**Scan & Stay** is an enterprise-grade, responsive smart hotel reservation and management platform built on 3 foundational pillars:
1. **Security** (Cryptographic HMAC-SHA256 Signed QR Passes, Anti-Replay Nonce, bcrypt password hashing, RBAC, Rate-Limiting & Fraud Detection)
2. **Authentication** (JWT session tokens, Google OAuth simulation, 2FA OTP verification, Role-based multi-user workflows)
3. **Responsive Architecture** (Tailwind CSS, Glassmorphism, Framer Motion animations, Leaflet interactive maps, IoT smart key simulation)

---

## 🌟 Key Features

### 👤 Guest Experience
- **Hotel Browsing & Interactive Map Explorer**: Filter by destination (Goa, Jaipur, Bengaluru, Manali, Udaipur, Mumbai), price range slider, rating filters, and luxury amenities.
- **Room Category Selection**: Standard Deluxe, Executive Sea View Suites, Presidential Suites with live availability.
- **Fast Checkout & Simulated Payment**: Multi-step checkout with simulated Razorpay / UPI payments and instant loyalty point redemption.
- **Cryptographic QR Boarding Pass**: High-resolution, tamper-proof QR code generated automatically on booking confirmation.
- **Smart IoT Room Key Simulator**: Tap-to-unlock NFC/BLE simulated door unlocking with real-time feedback & access count.
- **In-Room Dining & Services**: Digital room service ordering directly linked to room and stay pass.
- **Downloadable Tax Invoice**: Official PDF tax receipts generated in real-time with GST breakdown.
- **StayBot AI Concierge**: Built-in AI assistant with voice recognition support and intelligent travel guidance.
- **Notifications Dispatch**: Simulated live WhatsApp and Email alerts.

### 🛡️ Admin & Front Desk Portal
- **Live QR Check-In Scanner**: Front desk barcode/camera scanner for 5-second guest check-in/out with instant HMAC verification.
- **Analytics & Revenue Dashboard**: Real-time KPI counters (Total Revenue, Occupancy Rate, Active In-House Guests, Available Rooms).
- **Reservations Ledger**: Complete booking registry with search, status filters, and 1-click status transitions.
- **Hotel & Inventory Manager**: Real-time room rate adjustments and occupancy toggles.
- **Security & Fraud Audit Logs**: Live stream of system actions, suspicious attempt flags, IP addresses, and device signatures.
- **AI Dynamic Pricing Optimizer**: Yield management advisor predicting surge demand and optimal seasonal multipliers.

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login Ready)

| Role | Email | Password | Features / Access |
| :--- | :--- | :--- | :--- |
| **Guest** | `guest@scanstay.com` | `guest123` | Active Stay at Goa, QR Pass, IoT Door Key, 650 Loyalty Points |
| **Receptionist** | `reception@scanstay.com` | `reception123` | Live QR Scanner Station, Check-in / Check-out execution |
| **Admin** | `admin@scanstay.com` | `admin123` | Full Analytics, Security Audit Logs, Pricing Optimizer |

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 1. Launch Backend Server
```bash
cd backend
# Activate virtual environment
.\venv\Scripts\activate
# Start FastAPI backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Launch Frontend Server
```bash
cd frontend
npm run dev
```
Web App will be live at: [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Project Architecture

```bash
scan-and-stay/
├── backend/
│   ├── app/
│   │   ├── core/           # Config, JWT, HMAC QR Signing & bcrypt Security
│   │   ├── database/       # SQLAlchemy models, session, rich seeder
│   │   ├── schemas/        # Pydantic validation schemas
│   │   ├── routes/         # Auth, Hotels, Rooms, Bookings, QR, Payments, AI, Admin
│   │   └── main.py         # FastAPI entry point & Lifespan handler
│   ├── requirements.txt
│   └── scan_and_stay.db    # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Footer, QR Modal, IoT Key Simulator, Map, AI Drawer
│   │   ├── context/        # AuthContext & Session management
│   │   ├── pages/          # Home, Explore, HotelDetail, Booking, UserDashboard, AdminDashboard
│   │   ├── services/       # API client with JWT bearer interceptors
│   │   └── styles/         # Tailwind CSS & glassmorphism
│   ├── package.json
│   └── vite.config.ts
├── start_all.bat
├── start_backend.bat
└── start_frontend.bat
```
