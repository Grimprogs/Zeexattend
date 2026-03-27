# InternTrack - QR Intern Attendance System

InternTrack is a full-stack React + Firebase attendance system where interns use personal QR codes and admins scan them to mark entry and exit.

LIVE : https://zeexattend.vercel.app/

## Tech Stack

- React + Vite
- Firebase Authentication
- Firestore Database
- react-router-dom
- html5-qrcode
- qrcode.react
- react-hot-toast
- date-fns

## Features

- Intern signup with profile fields: Full Name, Email, Phone, Department, Password
- Intern login and admin login
- Role-based route protection (intern/admin)
- Intern dashboard with:
  - Profile information
  - Unique QR code generated from JSON payload
  - QR code PNG download
  - Personal attendance history
- Admin panel with sidebar and 5 pages:
  - Dashboard Overview
  - QR Scanner
  - All Interns
  - Attendance Logs with filters and CSV export
  - Intern Profiles with QR preview modal

## Firebase Setup

1. Open https://console.firebase.google.com
2. Create a new project.
3. Enable Authentication:
   - Go to Authentication -> Sign-in method
   - Enable Email/Password
4. Create Firestore Database:
   - Go to Firestore Database
   - Start in test mode (for development)
5. Create collections:
   - interns
   - attendance
6. Manually create admin account in Authentication:
   - Email: admin@interntrack.com
   - Password: your admin password
7. Create admin role document in Firestore:
   - Path: /admins/{uid}
   - Data: { role: "admin" }
   - uid must match the Firebase Auth UID of admin@interntrack.com
8. Replace Firebase config in src/firebase.js with your project values.

## Firestore Data Structure

### interns collection

/interns/{uid}

- uid: string
- name: string
- email: string
- phone: string
- department: string
- createdAt: Timestamp
- profileComplete: boolean

### attendance collection

/attendance/{autoId}

- uid: string
- name: string
- department: string
- date: string (YYYY-MM-DD)
- entryTime: Timestamp
- exitTime: Timestamp | null
- status: "present" | "checked-out"

## QR Payload Format

The intern QR code stores this JSON string:

{
  "uid": "...",
  "name": "...",
  "email": "...",
  "phone": "...",
  "department": "..."
}

## How Attendance Logic Works

On admin QR scan:

1. Parse QR JSON payload.
2. Find intern by uid in Firestore (/interns/{uid}).
3. Check if there is an open attendance record for today:
   - open record = status "present" with no exit yet
4. If no open record:
   - Create new record with entryTime and status "present"
5. If open record exists:
   - Update same record with exitTime and status "checked-out"
6. Show toast message confirming entry or exit.

## Run Locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Syntax Explanation (Important)

This section explains major syntax patterns used in this project.

### 1) React State: useState

Example:

```jsx
const [loading, setLoading] = useState(false)
```

- loading is the current value.
- setLoading updates loading and triggers re-render.
- useState(false) means default value is false.

### 2) React Side Effects: useEffect

Example:

```jsx
useEffect(() => {
  // async fetch logic
}, [user?.uid])
```

- useEffect runs after component render.
- Dependency array [user?.uid] means it reruns when user uid changes.
- Used for data fetch, subscriptions, and lifecycle-like logic.

### 3) Controlled Inputs

Example:

```jsx
<input name="email" value={form.email} onChange={onChange} />
```

- value comes from React state.
- onChange updates state.
- This gives full control over form data.

### 4) Object Spread Syntax

Example:

```jsx
setForm((prev) => ({ ...prev, [name]: value }))
```

- ...prev copies old object fields.
- [name]: value dynamically updates one key.
- Prevents losing other form fields.

### 5) Optional Chaining

Example:

```jsx
user?.uid
```

- If user is null/undefined, returns undefined instead of crashing.
- Safe access for nested values.

### 6) Async/Await

Example:

```jsx
const snapshot = await getDocs(queryRef)
```

- await pauses inside async function until Promise resolves.
- Makes asynchronous code easier to read than chained .then calls.

### 7) Firebase Auth Create User

Example:

```jsx
const credential = await createUserWithEmailAndPassword(auth, email, password)
```

- Creates auth account.
- Returns credential.user with uid/email metadata.

### 8) Firestore setDoc and doc

Example:

```jsx
await setDoc(doc(db, 'interns', credential.user.uid), data)
```

- doc(db, 'interns', uid) points to /interns/{uid}.
- setDoc writes full document at that path.

### 9) Firestore Query Syntax

Example:

```jsx
query(
  collection(db, 'attendance'),
  where('uid', '==', user.uid),
  orderBy('entryTime', 'desc'),
)
```

- collection gives base collection.
- where adds filter condition.
- orderBy sorts results.
- query composes all constraints into one query object.

### 10) Timestamps

Example:

```jsx
entryTime: serverTimestamp()
```

- serverTimestamp() stores timestamp from Firebase server clock.
- Avoids client clock mismatch issues.

### 11) React Router Nested Routes

Example:

```jsx
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<DashboardOverview />} />
  <Route path="scanner" element={<ScannerPage />} />
</Route>
```

- Parent route renders layout.
- Child routes render inside layout using Outlet.
- index means default child page for /admin.

### 12) Protected Routes

Example:

```jsx
<Route element={<ProtectedRoute allow="admin" />}>
  <Route path="/admin" element={<AdminLayout />} />
</Route>
```

- ProtectedRoute checks logged-in user and role.
- allow="admin" restricts access to admin only.

### 13) Template Strings

Example:

```jsx
`Entry marked for ${name} at ${time}`
```

- Inject variables inside string using ${...}.
- Cleaner than string concatenation.

### 14) Dynamic Class Names

Example:

```jsx
<span className={`pill ${item.status}`}>{item.status}</span>
```

- class changes based on data.
- Used to style present vs checked-out states.

### 15) CSV Download in Browser

Example:

```jsx
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
const url = URL.createObjectURL(blob)
```

- Blob creates a virtual file in memory.
- createObjectURL makes downloadable link.
- Anchor click starts download.

## Notes

- Ensure Firestore indexes are created if Firebase prompts composite index errors.
- Do not keep Firestore in test mode for production. Add security rules.
