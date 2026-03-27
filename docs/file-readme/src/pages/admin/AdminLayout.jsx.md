# src/pages/admin/AdminLayout.jsx

## Purpose
Provides admin sidebar shell and nested page outlet.

## What it includes
- Sidebar links for all admin pages
- Active link highlighting
- Logged-in admin email
- Logout button
- <Outlet /> for current admin child page

## Syntax notes
- NavLink className callback applies active class.
- end prop on /admin avoids partial match confusion.
