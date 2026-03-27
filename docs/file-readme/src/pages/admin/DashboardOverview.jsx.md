# src/pages/admin/DashboardOverview.jsx

## Purpose
Shows top-level attendance stats and today's table.

## Data pulled
- All interns count
- Today's attendance records by date
- Total attendance document count

## Derived stats
- Present today: status = present
- Checked out today: status = checked-out

## Syntax notes
- useMemo computes stat cards from fetched arrays.
- date key uses helper toDateKey().
