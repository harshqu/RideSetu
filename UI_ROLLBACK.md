# RideSetu — UI Rollback & Versioning Guide

This document explains the multi-tier UI branching strategy and rollback instructions.

---

## 1. Branch Architecture

| Branch | State | Description |
| :--- | :--- | :--- |
| `ui/legacy` | **Original MVP Baseline** | The original working UI baseline before visual redesign. |
| `ui/premium-before-polish` | **Redesign Baseline** | The premium Himalayan redesigned UI prior to the second-level polish pass. |
| `ui/premium-polish` | **Active / Polished UI** | The polished UI with count-up stats, enhanced hero typography, smooth scroll reveal, and mobile UX refinements. |
| `main` | **Master Track** | Production baseline. |

---

## 2. Safe Rollback Instructions

### To Rollback to the Pre-Polish Premium UI:
```bash
git checkout ui/premium-before-polish
npm run dev
```

### To Rollback to the Legacy Original MVP UI:
```bash
git checkout ui/legacy
npm run dev
```

### To Switch to the Active Polished UI:
```bash
git checkout ui/premium-polish
npm run dev
```

---

## 3. Preservation Guarantee

- **Zero Backend Changes**: MongoDB schemas, database connections, API contracts, RBAC, KYC verification logic, double-booking prevention, pricing/GST/deposit math, and refund engines are 100% untouched.
- **Database Data Integrity**: No UI state or configuration is stored in MongoDB.
