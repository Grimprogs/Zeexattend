# src/firebase.js

## Purpose
Creates one Firebase app instance and exports shared services used across the app.

## What this file does
- Calls initializeApp(firebaseConfig)
- Creates Auth via getAuth(app)
- Creates Firestore via getFirestore(app)
- Optionally initializes Analytics when supported

## Syntax notes
- Object literal: firebaseConfig = { ... }
- Named exports: export const auth, db, analytics
- Promise usage: isSupported().then(...)

## Why centralize this
Keeping Firebase setup in one file prevents duplicate app initialization and makes imports clean in other files.
