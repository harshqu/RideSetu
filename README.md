# RideSetu

**One Place. Every Ride. Every Destination.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![E2E Verification](https://img.shields.io/badge/E2E%20Tests-250%2F250%20PASS-brightgreen?style=flat)](#testing)
[![Availability](https://img.shields.io/badge/Availability-19%2F19%20PASS-brightgreen?style=flat)](#testing)

---

## 📌 Project Overview

**RideSetu** is a multi-vendor travel mobility marketplace where tourists and travellers can discover, compare, and book verified rental two-wheelers (scooters, motorcycles, EVs) and self-drive cars from licensed local rental operators across the Himalayan foothills of Uttarakhand.

Traditional vehicle rentals in tourist destinations suffer from fragmented pricing, unverified fleet conditions, arbitrary security deposit withholdings, and sudden double-bookings. RideSetu resolves these issues through:
- **Side-by-Side Vehicle Comparison & Search**
- **Cryptographic Double-Booking Prevention & Distributed Inventory Locks**
- **Transparent Server-Calculated Pricing with Security Deposit Isolation**
- **360° Digital Handover Inspection Certificates**
- **Customer Driving Licence & Identity KYC Verification**
- **Vendor Onboarding, Document Compliance & Fleet Governance**
- **Server-Side Tiered Cancellation & Idempotent Refund Engine**
- **Verified Customer Reviews & Official Vendor Responses**
- **Multi-Channel Notification Dispatcher**
- **Impartial Administrative Dispute Arbitration**

---

## 🚀 Sandbox & Pilot Notice

> [!IMPORTANT]
> **Controlled Pilot / Development Environment**:
> - `PAYMENT_PROVIDER=MOCK` / `RAZORPAY_SANDBOX`: Test-mode payments only. Real-money transactions are NOT active.
> - `PAYOUT_PROVIDER=MOCK`: Bank transfers and settlements are calculated in mock ledger mode without live banking transfers.
> - `NOTIFICATION_PROVIDER=MOCK`: In-app notifications are stored in MongoDB Atlas with mock delivery adapters for Email/SMS/WhatsApp.
> - `KYC Verification`: Uses an administrative review workflow (`ADMIN_REVIEW`). No third-party government verification claims are made.

---

## 🗺️ Initial Launch Destinations (Uttarakhand)

- 🌊 **Rishikesh** (Tapovan, Laxman Jhula, Railway Station, AIIMS)
- 🏔️ **Mussoorie** (Mall Road, Picture Palace, Library Chowk)
- 🌲 **Dehradun** (ISBT, Railway Station, Jolly Grant Airport)
- 🛕 **Haridwar** (Har Ki Pauri, Railway Station)
- ⛵ **Nainital** (Mallital, Tallital, Nainital Lake)
- 🚂 **Haldwani** (Kathgodam Station, Bus Station)

---

## 🧩 Architectural Features

### 1. 👤 Customer Experience
- **Destination & GPS Vehicle Search**: Instant vehicle discovery by destination hub, vehicle category, and pickup/return date-time slots.
- **Multi-Vehicle Comparison**: Compare up to 4 vehicles simultaneously across daily prices, security deposits, KM limits, excess KM fees, delivery options, and included amenities.
- **Transparent Checkout**: Clear separation of base rental, hotel delivery charge, tech platform fee (₹49), GST (18%), discount coupons, and **100% Refundable Security Deposit** (₹1,000).
- **Digital KYC**: Upload driving licence front/back scans with AES-256 encrypted storage and status tracking (`PENDING`, `UNDER_REVIEW`, `VERIFIED`, `ACTION_REQUIRED`, `REJECTED`).
- **Saved Delivery Locations**: Save hotel, hostel, or resort addresses for 1-click doorstep delivery.
- **Active Ride Companion**: Real-time trip dashboard during active rentals with 24/7 SOS Roadside Assistance, one-click vendor hotline, and digital inspection certs.
- **Server-Side Cancellation & Live Refund Preview**: Automated refund calculation based on time before pickup (>48h: 100%, 24-48h: 75%, 12-24h: 50%, <12h: 0% rental refund; 100% security deposit always protected).
- **Verified Customer Reviews**: Rate trips across Overall, Vehicle Condition, Host Behavior, Pickup, and Delivery (1–5 stars) with derived `isVerifiedRental: true` badges.
- **In-App Notification Center**: Real-time alerts for booking confirmations, cancellations, refund completions, and review replies.
- **Dispute Filing**: Open formal dispute tickets for breakdown charges, incorrect deductions, or host behavior.

### 2. 🏢 Vendor & Fleet Management
- **Self-Service Onboarding**: Business profile setup with commercial rental licence, GST, operating hours, delivery radius, and bank details.
- **Document Compliance**: Encrypted upload of trade licences, GST certificates, identity proofs, and permits with 10-minute temporary signed preview URLs.
- **Fleet Inventory**: Add scooters, motorcycles, cars, and EVs with daily/weekly rates, deposits, and photo management (submitted for admin approval).
- **Availability Calendar & Blocking**: Visual schedule with 409 Conflict guards preventing vendor maintenance blocks over confirmed customer bookings.
- **Digital Handover Tool**: Perform pre-ride 360° photo capture, record fuel/odometer levels, and document scratches.
- **Review Replies**: Post official vendor replies to customer reviews on own fleet units.
- **Earnings & Payout Ledger**: Automated gross-to-net payout calculation with 15% platform take-rate isolation.

### 3. 🛡️ Admin Governance & RBAC
- **Customer KYC Review**: Inspect masked licence details and securely preview uploaded documents before approving/rejecting with recorded reasons.
- **Vendor & Fleet Approvals**: Approve or reject vendor applications and individual vehicles with mandatory justifications and immutable `AuditLog` records.
- **Review Moderation**: Audit customer reviews, hide toxic comments with mandatory reason logging, or restore flagged entries.
- **Payment & Refund Ledger**: Monitor all captured payments, idempotent refund logs, and gross marketplace volume.
- **Dispute Resolution**: Impartially arbitrate damage claims and deposit deductions based on digital inspection photos.
- **Marketplace Metrics**: Real-time GMV, net platform commission revenue, active fleet count, and registered operators.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router)** | Server & Client Components, SSR, Dynamic Routing |
| **UI & Styling** | **Tailwind CSS + Vanilla CSS** | Responsive styling, fluid layouts, custom tokens |
| **Icons** | **Lucide React** | Clean, accessible vector icons |
| **Backend** | **Next.js Route Handlers** | REST APIs, business services, rate limiting |
| **Database** | **MongoDB Atlas / Mongoose** | Distributed document database, compound indexing |
| **Authentication** | **JWT + bcryptjs** | Role-based token authentication (`CUSTOMER`, `VENDOR`, `ADMIN`) |
| **Security** | **AES-256-GCM + HMAC-SHA256** | Field-level encryption, signed document tokens |
| **Payments** | **Razorpay Test-Mode / Mock** | Server-side signature verification & idempotent refunds |

---

## 🔐 Security & Data Privacy

- **Zero Credentials in Client Bundles**: Database URIs, JWT secrets, encryption keys, and payment secrets are strictly confined to the server.
- **Field-Level Encryption**: Sensitive documents and licence details are encrypted with AES-256-GCM.
- **Signed Private Storage**: Document uploads are validated using file magic-bytes and served via short-lived HMAC-SHA256 signed URLs (10-minute validity).
- **Server-Side RBAC**: Every endpoint enforces strict ownership checks; customers and vendors cannot access cross-user records.
- **Deposit Isolation**: Security deposits (₹1,000) are never included in vendor revenue or platform earnings.
- **Production Headers**: HTTP security headers configured in `next.config.mjs` (`nosniff`, `SAMEORIGIN`, `strict-origin-when-cross-origin`, HSTS).

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 18.x or 20.x
- npm 9+
- MongoDB Atlas connection string (or local MongoDB)

### Installation
```bash
# Clone the repository
cd ridesetu

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Run Next.js development server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 🧪 Testing & Verification Suites

RideSetu includes comprehensive automated test suites covering pricing, availability, double-booking prevention, RBAC, KYC, vendor onboarding, cancellation, refunds, reviews, and notifications:

```bash
# 1. Core availability, pricing & double-booking suite
npm run test:availability

# 2. Comprehensive 250-point End-to-End verification suite
npm run test:e2e

# 3. High-concurrency double booking stress test (100 parallel threads)
npm run test:concurrency

# 4. Code quality & lint inspection
npm run lint

# 5. Full Next.js production build & type checking
npm run build
```

---

## 👥 Demo User Accounts

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@ridesetu.demo` | `customer123` | `/dashboard` |
| **Vendor** | `vendor@ridesetu.demo` | `vendor123` | `/vendor` |
| **Admin** | `admin@ridesetu.demo` | `admin123` | `/admin` |

---

## 📄 Legal & Compliance Pages

- **Terms of Service**: [`/terms`](/terms)
- **Privacy Policy**: [`/privacy`](/privacy)
- **Cancellation Policy**: [`/cancellation-policy`](/cancellation-policy)
- **Refund Policy**: [`/refund-policy`](/refund-policy)
- **Rental Guidelines**: [`/rental-policy`](/rental-policy)
- **Rider Safety & SOS Protocol**: [`/safety`](/safety)
- **Contact & Helpdesk**: [`/contact`](/contact)

*Disclaimer: Legal documents presented on the platform are for pilot informational purposes. Final legal text must be reviewed and certified by a qualified legal professional before commercial launch.*

---

## 📜 License

© 2026 RideSetu Technologies. All rights reserved. Built for Himalayan Travel Mobility.
