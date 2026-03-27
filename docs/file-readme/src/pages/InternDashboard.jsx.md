# src/pages/InternDashboard.jsx

## Purpose
Shows intern profile, QR + barcode, and personal attendance logs.

## Data load flow
1. Fetch intern profile from interns/{uid}.
2. Fetch attendance records filtered by uid.
3. Sort records latest-first.
4. Render table.

## QR + Barcode
- QR payload: JSON with uid/name/email/phone/department
- Barcode payload: ITK:<uid> (CODE128)

## Download logic
- QR: reads canvas and downloads PNG.
- Barcode: reads SVG, paints to canvas, downloads PNG.

## Syntax notes
- useMemo used for stable payload computation.
- useRef points to DOM nodes for download extraction.
