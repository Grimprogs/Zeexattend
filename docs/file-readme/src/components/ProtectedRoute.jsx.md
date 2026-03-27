# src/components/ProtectedRoute.jsx

## Purpose
Guards routes by login status and optional role.

## Behavior
- Shows Loading while auth state is unresolved.
- Redirects unauthenticated users to /login.
- Redirects wrong-role users to their allowed dashboard.
- Renders nested child routes using Outlet when allowed.

## Syntax notes
- <Outlet /> is where child route component appears.
- <Navigate to="..." replace /> does redirect safely.
