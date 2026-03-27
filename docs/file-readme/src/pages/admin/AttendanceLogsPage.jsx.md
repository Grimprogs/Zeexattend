# src/pages/admin/AttendanceLogsPage.jsx

## Purpose
Shows complete attendance history with filters and CSV export.

## Filters
- Date
- Department
- Status

## Export
- Builds CSV rows from filtered dataset
- Creates Blob URL and triggers download

## Syntax notes
- useMemo used for filteredLogs and department list.
- Controlled inputs keep filter UI in React state.
