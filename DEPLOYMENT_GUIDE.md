# RideSetu — Production Deployment & Cloud Architecture Guide

This comprehensive guide details the deployment procedure for RideSetu on modern cloud infrastructure (Vercel, AWS/DigitalOcean, and MongoDB Atlas) in Sandbox/Pilot mode.

---

## 1. MongoDB Atlas Database Configuration

1. **Create Database Cluster**:
   - Provision a MongoDB Atlas Cluster (M0 Sandbox or M10+ Production).
   - Recommended Region: `ap-south-1` (Mumbai, India) for minimal latency across Uttarakhand and North India.
2. **Network Access**:
   - Add IP whitelist rules (or allow access from Vercel static IPs / `0.0.0.0/0` with strong password authentication).
3. **Database User & Permissions**:
   - Create a database user with `readWrite` access to the `ridesetu` database.
   - Example connection string:
     ```
     mongodb+srv://<username>:<password>@cluster0.ridesetu.mongodb.net/ridesetu?retryWrites=true&w=majority
     ```
4. **Database Indexes**:
   - All critical indexes (e.g. `bookings.reservationHoldExpiresAt`, `vehicles.destinationId`, `reviews.bookingId`) are indexed via Mongoose schemas.

---

## 2. Environment Variables Configuration

Set these environment variables in your deployment dashboard (e.g. Vercel Project Settings → Environment Variables):

| Variable | Description | Example / Default | Required |
| :--- | :--- | :--- | :--- |
| `MONGODB_URI` | MongoDB Atlas Connection String | `mongodb+srv://...` | Yes |
| `JWT_SECRET` | Secret key for JWT session tokens (min 32 chars) | `your-32-char-random-jwt-secret` | Yes |
| `ENCRYPTION_KEY` | AES-256-GCM hex key (32 bytes / 64 hex chars) | `64-character-hex-string` | Yes |
| `NEXT_PUBLIC_APP_URL` | Public production domain | `https://ridesetu.com` | Yes |
| `PAYMENT_PROVIDER` | Payment engine mode (`MOCK` or `RAZORPAY_SANDBOX`) | `RAZORPAY_SANDBOX` | Yes |
| `RAZORPAY_KEY_ID` | Razorpay Test API Key ID | `rzp_test_...` | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay Test API Key Secret | `your-razorpay-test-secret` | Yes |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Secret for signature verification | `your-webhook-secret` | Yes |
| `PAYOUT_PROVIDER` | Payout provider mode | `MOCK` | Yes |
| `NOTIFICATION_PROVIDER` | Notification dispatch mode | `MOCK` | Yes |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API Key (Optional) | `AIzaSy...` | Optional |

> [!CAUTION]
> **Zero Credential Leaks**: Never expose `JWT_SECRET`, `ENCRYPTION_KEY`, `RAZORPAY_KEY_SECRET`, or `MONGODB_URI` with the `NEXT_PUBLIC_` prefix.

---

## 3. Local Development & Seed

```bash
# 1. Install dependencies
npm install

# 2. Configure local environment
cp .env.example .env.local

# 3. Seed verified fleet, destinations, and partner operators
npm run db:seed

# 4. Start development server
npm run dev
```

---

## 4. Production Build & Validation

Run the full pre-deployment verification pipeline locally before pushing:

```bash
# Linting
npm run lint

# Next.js Production Build
npm run build

# Architecture & Availability Tests
npm run test:availability

# Full End-to-End Test Suite
npm run test:e2e

# Date Sync & Razorpay Test Suite
npx tsx src/scripts/test-reservation-razorpay.ts

# Mobile Viewport & Overflow Audit
npx tsx src/scripts/test-mobile-overflow.ts

# Security & Secret Exposure Audit
npx tsx src/scripts/test-security-scan.ts
```

---

## 5. Vercel Deployment

1. **Import Repository**:
   - Link GitHub/GitLab repository to Vercel.
2. **Framework Preset**:
   - Select `Next.js`.
3. **Root Directory**:
   - `./`
4. **Build Command**:
   - `npm run build`
5. **Install Command**:
   - `npm install`
6. **Environment Variables**:
   - Paste all required environment variables into the Vercel project settings.
7. **Deploy**:
   - Trigger production deployment.

---

## 6. Custom Domain & SSL Configuration

1. In Vercel Domain Settings, add `ridesetu.com` and `www.ridesetu.com`.
2. Configure DNS A/CNAME records at your DNS registrar:
   - `A @ 76.76.21.21`
   - `CNAME www cname.vercel-dns.com`
3. SSL certificates will automatically be generated and renewed via Let's Encrypt / Vercel Edge Network.

---

## 7. Razorpay Test/Sandbox Integration

1. In Razorpay Dashboard, toggle to **Test Mode**.
2. Navigate to **Settings → API Keys** and generate a Test Key ID (`rzp_test_...`) and Secret.
3. Configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in environment variables.
4. Set `PAYMENT_PROVIDER=RAZORPAY_SANDBOX`.
5. Test payments will automatically use the sandbox gateway with simulated card and UPI test credentials.

---

## 8. Razorpay Webhook Configuration

1. In Razorpay Dashboard, navigate to **Settings → Webhooks**.
2. Add Webhook URL: `https://your-domain.com/api/payments/webhook`.
3. Select Events:
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
4. Set a strong Webhook Secret and set it as `RAZORPAY_WEBHOOK_SECRET` in Vercel.

---

## 9. Production Security Checklist

- [x] All database queries use parameterized Mongoose find/update operations (No NoSQL injection).
- [x] Passwords hashed with `bcryptjs` (salt factor 10).
- [x] Role-Based Access Control (RBAC) enforced across Customer, Vendor, and Admin routes.
- [x] Driving Licence numbers and sensitive customer info masked on non-admin client views.
- [x] Refundable security deposit isolated from rental revenue across all ledger calculations.
- [x] Razorpay signatures verified via HMAC-SHA256 before confirming bookings.
- [x] Health check endpoint active at `/api/health`.
- [x] Zero secret leaks in client bundles (`test-security-scan.ts` PASS).

---

## 10. Rollback Procedure

In case of any unexpected production regression:

```bash
# Instant rollback in Vercel
vercel rollback

# Or revert to prior Git milestone snapshot
git checkout ui/mobile-responsive-fix
```
