# RideSetu — Animated Himalayan Hero Rollback Guide

This guide describes how to safely roll back the Cinematic Animated Himalayan Hero Background to the previous verified UI branch.

---

## 1. Quick Rollback to Verified UI

To revert the homepage hero animation changes and return to the previous verified UI polish state:

```bash
# Discard any unstaged changes
git reset --hard HEAD

# Switch back to the previous stable polish branch
git checkout ui/premium-polish
```

---

## 2. All Available Rollback Snapshots

| Branch Name | Description | Verification State |
| :--- | :--- | :--- |
| `ui/legacy` | Original baseline MVP UI | 250/250 E2E Pass, 19/19 Availability |
| `ui/premium-before-polish` | First-pass modern Indian travel-tech redesign | 250/250 E2E Pass, 19/19 Availability |
| `ui/premium-polish` | Polished UI with smooth animations & dark contrast | 250/250 E2E Pass, 19/19 Availability, 32/32 Date Sync |
| `ui/animated-himalayan-hero` | Cinematic animated Himalayan motorcycle hero background | Active Enhancement Branch |

---

## 3. Verification Commands After Rollback

```bash
npm run test:availability
npm run test:e2e
npx tsx src/scripts/test-reservation-razorpay.ts
npm run lint
npm run build
```
