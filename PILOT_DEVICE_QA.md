# RideSetu — Real Device Pilot QA Checklist

This checklist defines the 24-step verification protocol for testing the RideSetu application on real mobile and desktop devices during the Controlled Pilot phase.

---

## 1. Real Device Inspection Checklist

- [x] **Step 1 — Homepage Discovery**: Open `http://localhost:3000` or production domain on mobile (360x800, 390x844, 412x915, 430x932). Ensure hero headline wraps naturally and cinematic parallax animation is strictly contained.
- [x] **Step 2 — PWA Installation**: Verify PWA install prompt banner appears non-intrusively after 3s; test install flow or dismissal persistence.
- [x] **Step 3 — User Authentication**: Sign in as customer (`test@ridesetu.com` / `pass123`).
- [x] **Step 4 — Location Hub Search**: Select *Rishikesh* or *Mussoorie* from the search widget.
- [x] **Step 5 — Vehicle Filtering**: Filter by category (*SCOOTER* / *BIKE*), transmission (*Automatic* / *Manual*), and delivery options.
- [x] **Step 6 — Vehicle Detail Inspection**: Open vehicle detail page `/vehicles/[id]`, review transparent price breakdown and live server pricing preview.
- [x] **Step 7 — Date/Time Selection**: Select Pickup (e.g. 20 Aug 09:00) and Return (e.g. 21 Aug 20:00).
- [x] **Step 8 — Server Pricing Verification**: Verify pricing calculates 2 billable days (Base ₹920 + Platform ₹49 + GST ₹174 + Deposit ₹1,000 = ₹2,143).
- [x] **Step 9 — Customer KYC Check**: Verify Driving Licence upload interface accepts JPG/PDF documents; verify DL number is masked on non-admin client responses.
- [x] **Step 10 — Reservation Lock**: Click *"Proceed to Pay"* to acquire 15-minute temporary reservation lock.
- [x] **Step 11 — Razorpay Sandbox Checkout**: Open Checkout modal in Razorpay Sandbox mode with customer prefill.
- [x] **Step 12 — Test Payment Execution**: Complete sandbox test payment (UPI / Card / NetBanking).
- [x] **Step 13 — Server HMAC Signature Verification**: Server validates cryptographic HMAC-SHA256 signature and verifies amount matches server total.
- [x] **Step 14 — Booking Confirmation**: Confirm booking status transitions to `CONFIRMED` and reservation lock is confirmed.
- [x] **Step 15 — In-App Notification**: Confirm in-app booking confirmation notification is logged and visible.
- [x] **Step 16 — Rider Dashboard**: Open `/dashboard` to view active companion card, trip dates, and pickup hub.
- [x] **Step 17 — Printable Receipt**: View and print digital voucher with isolated ₹1,000 escrow security deposit notice.
- [x] **Step 18 — Vendor Booking Portal**: Switch to Vendor role (`/vendor`) and verify booking appears in fleet schedule.
- [x] **Step 19 — Vendor Payout Eligibility**: Verify payout state is `ELIGIBLE` and security deposit is 100% excluded from vendor earnings.
- [x] **Step 20 — Cancellation & Refund**: Initiate booking cancellation and verify refund window policy (>48h = 100% rental + 100% deposit).
- [x] **Step 21 — Dispute Management**: Verify dispute submission flow with file upload attachments.
- [x] **Step 22 — Offline Network Banner**: Disconnect network/Wi-Fi and verify top *"You're offline"* warning banner appears and clears on reconnect.
- [x] **Step 23 — Mobile Drawer Navigation**: Open hamburger menu on small viewport; verify avatar, links, ESC dismiss, and body scroll lock.
- [x] **Step 24 — Health & Readiness APIs**: Query `GET /api/health` and `GET /api/ready` to verify 200 OK status.

---

## 2. Tested Viewport Matrix

| Viewport | Device Profile | Status |
| :--- | :--- | :--- |
| `360 × 800` | Android Compact | **PASS** |
| `390 × 844` | iPhone 12 / 13 / 14 | **PASS** |
| `412 × 915` | Google Pixel 7 | **PASS** |
| `430 × 932` | iPhone 14 Pro Max | **PASS** |
| `768 × 1024` | iPad Portrait | **PASS** |
| `1024 × 768` | iPad Landscape | **PASS** |
| `1440 × 900` | Desktop Standard | **PASS** |
