# src/pages/admin/InternProfilesPage.jsx

## Purpose
Shows intern cards and modal with full details plus QR + barcode preview.

## Flow
- Loads intern profiles list from Firestore.
- Opens selected profile in modal.
- Builds QR and barcode payload from selected intern.
- Modal rendered via portal for stable overlay.

## Syntax notes
- initials function converts full name to avatar letters.
- useMemo recalculates payload only when selected changes.
