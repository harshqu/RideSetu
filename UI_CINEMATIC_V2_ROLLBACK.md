# RideSetu — Cinematic Himalayan Hero V2 Rollback Guide

This document provides independent rollback instructions for the Complete Cinematic Himalayan Animated Hero Rebuild.

---

## 1. Quick Rollback Commands

To revert this rebuild and return to any previous milestone branch:

```bash
# Discard any unstaged changes
git reset --hard HEAD

# Revert to previous hero iteration
git checkout ui/animated-himalayan-hero

# Or revert to stable premium polish state
git checkout ui/premium-polish
```

---

## 2. All Rollback Snapshots

| Branch Name | Description | Verification State |
| :--- | :--- | :--- |
| `ui/legacy` | Initial MVP UI baseline | 250/250 E2E Pass, 19/19 Availability |
| `ui/premium-before-polish` | First-pass modern Indian travel-tech redesign | 250/250 E2E Pass, 19/19 Availability |
| `ui/premium-polish` | Polished UI with smooth animations & dark contrast | 250/250 E2E Pass, 19/19 Availability, 32/32 Date Sync |
| `ui/animated-himalayan-hero` | Initial animated hero iteration | 250/250 E2E Pass, 19/19 Availability |
| `ui/cinematic-himalayan-v2` | Complete Cinematic Himalayan Animated Hero Rebuild | Active Enhancement Branch |

---

## 3. Post-Rollback Verification

```bash
npm run test:availability
npm run test:e2e
npx tsx src/scripts/test-reservation-razorpay.ts
npm run lint
npm run build
```
