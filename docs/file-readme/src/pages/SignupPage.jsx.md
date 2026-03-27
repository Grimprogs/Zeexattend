# src/pages/SignupPage.jsx

## Purpose
Registers new interns and creates Firestore profile.

## Validation
- Phone regex check before API call.

## Submit flow
1. createUserWithEmailAndPassword creates auth account.
2. setDoc writes interns/{uid} with profile fields.
3. createdAt uses serverTimestamp for reliable time.
4. Navigate to /intern.

## Syntax notes
- useMemo caches phone validation result from form.phone.
- serverTimestamp() avoids client clock mismatch.
