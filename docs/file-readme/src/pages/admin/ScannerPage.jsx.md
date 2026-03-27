# src/pages/admin/ScannerPage.jsx

## Purpose
Marks entry/exit using camera scan, image upload scan, and hardware scanner input.

## Input modes
1. Live camera scanner (QR + barcode formats)
2. Upload image and decode QR/barcode
3. Machine input box (USB scanner types code + Enter)

## Attendance logic
1. Extract uid from scanned value.
2. Verify intern exists in interns/{uid}.
3. Check open record for today (status present).
4. If open missing: create entry record.
5. If open exists: update same record with exit and checked-out.

## Syntax notes
- useRef stores scanner instance and running state.
- Cleanup in useEffect prevents start/stop race crash.
- serverTimestamp used for entry/exit writes.
