# src/pages/admin/AllInternsPage.jsx

## Purpose
Shows intern table and opens detailed modal with attendance history.

## Flow
- Loads interns list on mount.
- On View click, fetches selected intern attendance by uid.
- Sorts logs descending by entry time.
- Renders modal using createPortal for proper overlay behavior.

## Syntax notes
- createPortal(..., document.body) avoids layout issues for modal.
- Client-side sort removes dependency on Firestore orderBy index for this query.
