# RideSetu — Travel Mobility Marketplace

> **Tagline**: *One Place. Every Ride. Every Destination.*  
> **Product Vision**: A multi-vendor travel mobility marketplace connecting tourists and travellers with verified local vehicle rental businesses across India's top travel destinations (Uttarakhand launch: Rishikesh, Mussoorie, Dehradun, Nainital, Haridwar, Haldwani).

---

## 🌟 Core Differentiators

Unlike traditional single-operator rental platforms, **RideSetu** is a multi-vendor travel marketplace designed with:
1. **Verified Local Rental Marketplace**: Compare multiple independent local rental operators side-by-side in one place on pricing, deposits, and ratings.
2. **Dedicated Side-by-Side Comparison Engine**: Compare up to 4 vehicles simultaneously across daily rates, refundable security deposits, KM limits, excess KM fees, delivery options, and included equipment.
3. **Strict Server-Side Double Booking Prevention**: Timestamp-precision overlap detection (`requestedPickup < existingReturn && requestedReturn > existingPickup`) validated atomically before confirmation.
4. **Digital Vehicle Handover System**: Pre-pickup 360° photo inspection with scratch marker pinboard and odometer/fuel logs + Return check-in diff analysis to protect customer security deposits.
5. **Transparent Pricing Separation**: Explicit itemization distinguishing base rental, delivery charges, platform convenience fee, GST, coupon discounts, and **100% Refundable Security Deposit** (isolated from platform revenue).
6. **Active Ride Live Companion**: In-app trip dashboard with 24/7 Roadside Assistance SOS, direct vendor hotline, digital handover certificates, and real-time rental extension.
7. **SaaS-grade Vendor Dashboard & Calendar Blocker**: Local operators manage fleet, block maintenance dates, perform digital handovers, and receive automated payout settlements.
8. **Admin Control Console**: Marketplace GMV metrics, take-rate analytics, vendor/vehicle compliance verification, damage dispute arbitration, and coupon management.

---

## 🚀 Demo Accounts & Credentials

For development and demonstration testing, the database includes pre-seeded demo accounts:

| Role | Email | Password | Description |
|---|---|---|---|
| **Customer** | `customer@ridesetu.demo` | `customer123` | Aarav Sharma (Verified Traveller profile, active bookings, KYC verified) |
| **Vendor** | `vendor@ridesetu.demo` | `vendor123` | Vikram Negi (Himalayan Wheels & Expeditions, Tapovan Rishikesh) |
| **Admin** | `admin@ridesetu.demo` | `admin123` | RideSetu Super Admin (Full marketplace control console) |

> ⚡ **Quick Switcher**: Use the 1-click role switcher bar at the top of the interface in development mode to instantly switch between Customer, Vendor, and Admin views without manual login!

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Backend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Database Layer**: MongoDB Atlas with Mongoose ODM.
- **Security & Auth**: Bcryptjs password hashing, JWT session cookies, server-side route guards.
- **Payment Architecture**: Razorpay-ready integration architecture + built-in interactive simulator (UPI QR, Cards, NetBanking).
- **Date/Time Engine**: Exact `pickupDateTime` and `returnDateTime` precision with atomic overlap checks.

---

## ⚙️ MongoDB Atlas Setup & Configuration

### Step 1: Create MongoDB Atlas Cluster
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 Sandbox** or dedicated cluster.
3. In **Database Access**, create a database user (e.g. `ridesetu_admin`) with a secure password.
4. In **Network Access**, allow IP access (e.g. `0.0.0.0/0` for development or your specific IP).
5. Click **Connect** → **Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/ridesetu?retryWrites=true&w=majority
   ```

### Step 2: Environment Variables
Create a file named `.env.local` in the project root:
```bash
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ridesetu?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_ridesetu_mock
RAZORPAY_KEY_SECRET=rzp_secret_ridesetu_mock
```

> 🔒 **Security**: Never commit `.env.local` or expose database credentials to client-side code.

---

## 📦 Local Development Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database Seeding
Populate MongoDB Atlas with realistic Uttarakhand destinations (Rishikesh, Mussoorie, Dehradun, Nainital, Haridwar, Haldwani), 10+ verified local rental vendors, 30+ vehicles, reviews, coupons, and sample bookings:
```bash
npm run db:seed
```

### 3. Run Logic & Architecture Tests
Verify double-booking prevention, pricing calculation accuracy, deposit isolation, and role authorization:
```bash
npm run test:availability
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂️ Project Structure

```
ridesetu/
├── .env.example                       # Environment template
├── .env.local                         # Local environment configuration
├── .gitignore                         # Excludes .env*, node_modules, .next
├── package.json                       # Next.js, Mongoose, Tailwind, Lucide, Bcryptjs
├── tsconfig.json                      # Strict TypeScript setup
├── src/
│   ├── lib/
│   │   ├── mongodb.ts                 # Cached Mongoose connection with dev pool
│   │   ├── auth.ts                    # JWT token creation, verification & cookies
│   │   └── utils.ts                   # INR formatting, duration calculation
│   ├── models/                        # 18+ Mongoose Schemas with compound indexes
│   │   ├── User.ts
│   │   ├── Vendor.ts
│   │   ├── Destination.ts
│   │   ├── PickupLocation.ts
│   │   ├── Vehicle.ts
│   │   ├── VehicleAvailability.ts
│   │   ├── Booking.ts
│   │   ├── DigitalHandoverReport.ts
│   │   ├── DamageReport.ts
│   │   ├── Dispute.ts
│   │   ├── Payment.ts
│   │   ├── Payout.ts
│   │   ├── Review.ts
│   │   ├── Coupon.ts
│   │   ├── SupportTicket.ts
│   │   ├── Notification.ts
│   │   ├── Favorite.ts
│   │   └── AuditLog.ts
│   ├── services/
│   │   ├── pricing.service.ts         # Centralized server-side pricing engine
│   │   ├── availability.service.ts    # Overlap detection & double-booking prevention
│   │   ├── booking.service.ts         # Transactional booking lifecycle
│   │   ├── payout.service.ts          # Post-completion payout computations
│   │   └── handover.service.ts        # Digital inspection & diff analysis
│   ├── scripts/
│   │   ├── seed.ts                    # Demo database seeding script
│   │   └── test-availability.ts       # Automated architecture test suite
│   ├── context/
│   │   ├── AuthContext.tsx            # Session & 1-click role switcher
│   │   └── CompareContext.tsx         # Multi-vehicle comparison state
│   ├── components/
│   │   ├── common/                    # DemoRoleBar, Navbar, Footer, AuthModal
│   │   ├── marketplace/               # SearchWidget, VehicleCard, FilterSidebar, CompareDrawer, CompareTable
│   │   ├── booking/                   # PriceBreakdownCard, PaymentModal, BookingVoucherCard
│   │   └── handover/                  # DigitalInspectionModal
│   └── app/
│       ├── page.tsx                   # High-converting Landing Page
│       ├── vehicles/                  # Search & filtering page + [id] details
│       ├── compare/                   # Full-page comparison matrix
│       ├── book/[vehicleId]/          # Multi-step checkout & payment
│       ├── destinations/[slug]/       # Destination landing pages
│       ├── dashboard/                 # Customer Live Active Ride Companion
│       ├── vendor/                    # Vendor SaaS portal
│       ├── admin/                     # Admin master control console
│       ├── bike-rental/[city]/        # Programmatic SEO pages
│       ├── scooty-rental/[city]/      # Programmatic SEO pages
│       ├── car-rental/[city]/         # Programmatic SEO pages
│       └── api/                       # REST endpoints
```

---

## 🛡️ License & Compliance

Compliant with the Uttarakhand Motor Vehicles Rules and Rental Motor Cycle Scheme 1997. Built for production mobility scale in Indian tourism hubs.
