# RideSetu — Production Deployment Rollback Strategy

This document provides step-by-step procedures for safely rolling back a deployment in the event of an operational regression during the Controlled Pilot phase.

---

## 1. Instant Vercel Rollback (Zero Downtime)

To immediately revert to the previous stable build in Vercel:

1. Navigate to **Vercel Dashboard → Project → Deployments**.
2. Locate the previous successful deployment corresponding to tag `v1.0.0-pilot`.
3. Click the **"..."** context menu and select **"Promote to Production"**.
4. Or run via CLI:
   ```bash
   vercel rollback
   ```
5. Verify health:
   ```bash
   curl -i https://your-domain.com/api/health
   curl -i https://your-domain.com/api/ready
   ```

---

## 2. Git Milestone Rollback

To revert local or CI/CD source code to any previous verified milestone:

```bash
# Rollback to Pilot release baseline
git checkout release/pilot-v1

# Or rollback to Razorpay Sandbox pilot integration
git checkout integration/razorpay-sandbox-pilot

# Or rollback to Final PWA UX milestone
git checkout ui/final-pwa-ux

# Or rollback to Mobile Responsive Fix milestone
git checkout ui/mobile-responsive-fix

# Or rollback to Stable Premium Polish milestone
git checkout ui/premium-polish
```

---

## 3. Database Rollback Constraints & Safety

> [!CAUTION]
> **Non-Destructive Rollback Rule**: Never drop collections or overwrite active production databases without an explicit, timestamped MongoDB Atlas snapshot backup.

1. **Schema Backwards Compatibility**:
   - All Mongoose schema enhancements are designed to be backwards-compatible (optional fields, defaults).
2. **Snapshot Restoration**:
   - In the event of catastrophic data corruption, use MongoDB Atlas Point-in-Time Recovery (PITR) to restore to a specific minute.
   - Do not perform destructive in-place restores without first archiving the current state.

---

## 4. Environment Variables & Webhook Rollback

1. **Payment Provider Mode**:
   - If Razorpay API connectivity is degraded, instantly switch to simulated mode by setting `PAYMENT_PROVIDER=MOCK` in Vercel project settings and redeploying.
2. **Webhook Endpoint**:
   - In Razorpay Dashboard → Settings → Webhooks, disable or update the webhook target URL if endpoint signature changes need to be rolled back.

---

## 5. Post-Rollback Verification Protocol

Execute the automated test suite against the target environment:

```bash
npm run test:availability
npm run test:e2e
npx tsx src/scripts/test-reservation-razorpay.ts
npx tsx src/scripts/test-reconciliation.ts
npx tsx src/scripts/test-visual-qa.ts
```
