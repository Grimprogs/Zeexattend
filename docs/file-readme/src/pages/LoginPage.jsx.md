# src/pages/LoginPage.jsx

## Purpose
Allows intern or admin sign-in.

## Form state
useState holds email and password in a controlled form object.

## Submit flow
1. Calls signInWithEmailAndPassword.
2. Checks user email.
3. If admin email, navigate to /admin.
4. Else navigate to /intern.
5. Show success/error toast.

## Syntax notes
- event.preventDefault() stops form page reload.
- Dynamic state update: setForm(prev => ({ ...prev, [name]: value }))
