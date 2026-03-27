# src/context/AuthContext.jsx

## Purpose
Stores login state globally and exposes user, role, loading, logout.

## Flow
1. onAuthStateChanged listens to Firebase auth changes.
2. If email is admin@interntrack.com, checks Firestore admins/{uid} role.
3. Sets role to admin or intern.
4. Exposes context value through useAuth hook.

## Syntax notes
- createContext + useContext for global state access.
- useMemo prevents unnecessary re-renders for value object.
- Async role resolution inside auth listener.

## Why this is needed
Any component can read auth data without prop-drilling.
