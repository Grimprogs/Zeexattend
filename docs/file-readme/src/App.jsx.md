# src/App.jsx

## Purpose
Defines the full route tree and global providers.

## What this file does
- Wraps app with AuthProvider
- Adds BrowserRouter for page routing
- Adds Toaster for notifications
- Creates protected routes for intern and admin
- Redirects unknown routes to login

## Syntax notes
- Nested routes render inside AdminLayout via Outlet.
- <Navigate replace /> performs route redirect.
- ProtectedRoute allow="admin" checks role.

## Route map summary
- /login
- /signup
- /intern (protected intern)
- /admin + child pages (protected admin)
