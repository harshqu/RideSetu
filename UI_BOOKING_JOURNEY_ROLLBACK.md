# RideSetu — End-to-End Booking Journey Polish Rollback Guide

This document provides independent rollback instructions for the End-to-End Booking Journey, Interaction Polish & Production UX pass.

---

## 1. Quick Rollback Commands

To revert this polish pass and return to any prior milestone:

```bash
# Discard all working tree changes
git reset --hard HEAD

# Return to cinematic hero v2 milestone
git checkout ui/cinematic-himalayan-v2

# Return to initial hero animation milestone
git checkout ui/animated-himalayan-hero

# Return to stable premium polish milestone
git checkout ui/premium-polish
```

---

## 2. All Rollback Snapshots

| Branch Name | Milestone Description | Status |
| :--- | :--- | :--- |
| `ui/legacy` | Legacy MVP UI baseline snapshot | Preserved |
| `ui/premium-before-polish` | First-pass modern Indian travel-tech redesign | Preserved |
| `ui/premium-polish` | Second-pass premium polish & date sync fixes | Preserved |
| `ui/animated-himalayan-hero` | Initial animated hero iteration | Preserved |
| `ui/cinematic-himalayan-v2` | Complete Cinematic Himalayan Animated Hero Rebuild | Preserved |
| `ui/booking-journey-polish` | End-to-End Booking Journey, UX Polish & Production Pass | Active Working Branch |

---

## 3. Verification Post-Rollback

```bash
npm run test:availability
npm run test:e2e
npx tsx src/scripts/test-reservation-razorpay.ts
npm run lint
npm run build
```
