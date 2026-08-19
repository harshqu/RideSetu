# RideSetu — UI Rollback & Versioning Guide

This document explains the UI branching strategy, backup state, and procedure to restore the previous UI if needed.

---

## 1. Branch Architecture

| Branch | State | Description |
| :--- | :--- | :--- |
| `ui/legacy` | **Backup / Stable MVP** | Contains the complete verified functional UI before the visual redesign. |
| `ui/premium-redesign` | **Active / In-Development** | Contains the modern travel-tech aesthetic UI redesign with Himalayan themes. |
| `main` | **Master Track** | Production baseline. |

---

## 2. Safe Rollback Instructions

If you wish to switch back to the legacy UI at any time without losing any backend logic or database models:

```bash
# 1. Stash or discard any uncommitted experimental design tweaks
git status

# 2. Checkout the legacy UI branch
git checkout ui/legacy

# 3. Verify that tests pass
npm run test:e2e
npm run test:availability

# 4. Start the development server on legacy UI
npm run dev
```

To switch back to the premium redesigned UI:
```bash
git checkout ui/premium-redesign
npm run dev
```

---

## 3. Scope of UI Redesign Files

The redesign exclusively touches presentation layers, stylesheets, and client components:
- `src/app/globals.css` (Visual tokens, gradients, animations, typography)
- `src/components/common/Navbar.tsx` (Glassmorphic header, mobile navigation drawer)
- `src/components/common/Footer.tsx` (Polished Himalayan footer)
- `src/components/common/DemoRoleBar.tsx` (Subtle floating role switch bar)
- `src/app/page.tsx` (High-impact Uttarakhand hero, floating search, trust cards, destinations)
- `src/app/vehicles/page.tsx` (Vehicle marketplace, filters, sorting, specs pills)
- `src/app/vehicles/[id]/page.tsx` (Immersive vehicle detail, specifications, deposit summary, sticky CTA)
- `src/app/book/[vehicleId]/page.tsx` (Multi-step checkout experience)
- `src/app/dashboard/page.tsx` (Modern customer travel companion)
- `src/app/vendor/page.tsx` (B2B fleet management SaaS portal)
- `src/app/admin/page.tsx` (Operations console)
- `src/app/compare/page.tsx` (Side-by-side vehicle comparison)

> [!NOTE]
> Database models, schemas, and API backend routes remain completely untouched and identical across both UI versions.
