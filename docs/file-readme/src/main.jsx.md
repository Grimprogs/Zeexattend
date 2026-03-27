# src/main.jsx

## Purpose
Entry point for React app rendering.

## What happens
- Imports global CSS
- Imports App component
- Uses createRoot to mount React into #root in index.html

## Syntax notes
- StrictMode wraps App to catch unsafe patterns in development.
- createRoot(document.getElementById('root')).render(...)

## Why important
Without this file, React UI would not mount in browser.
