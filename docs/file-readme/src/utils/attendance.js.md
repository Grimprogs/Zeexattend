# src/utils/attendance.js

## Purpose
Holds reusable helper functions for dates, QR/barcode payloads, CSV export, and scan parsing.

## Main helpers
- toDateKey: returns YYYY-MM-DD
- formatDateTime / formatTimeOnly: readable time display
- attendanceDuration: computes hours and minutes between entry and exit
- buildInternQrPayload: JSON string for QR
- buildInternBarcodePayload: barcode value (ITK:<uid>)
- extractUidFromScan: accepts QR JSON, barcode text, or raw uid
- toCsv: converts table data to CSV text

## Syntax notes
- Template literals: `${hours}h ${mins}m`
- Optional chaining: value?.toDate
- Regex checks for plain uid scanner input

## Benefit
All pages use same logic, so behavior is consistent and easier to maintain.
