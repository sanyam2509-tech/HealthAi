# HealthVault AI React

HealthVault AI React is a production-style React application that helps users store medical reports, understand them in simple language, and manage report history across family profiles.

## Problem Statement

Patients and families often receive lab reports as PDFs, images, or forwarded files. The documents get scattered, the wording is difficult to understand, and comparing old and new reports during follow-up visits becomes frustrating.

HealthVault AI React solves this by giving users:

- One authenticated place to store report history
- Separate family profiles inside one account
- AI-generated plain-language explanations of reports
- Saved report history for each profile
- Read-only sharing links for doctors or caregivers

## Users

- Patients who want to understand their own reports faster
- Families managing reports for parents, spouses, or children
- People preparing for doctor visits with past report history

## Why It Matters

- Medical reports are often confusing for non-medical users
- Families lose time searching across chats, downloads, and devices
- Follow-up care is harder when report history is not organized

## Core Features

- Email/password and Google authentication with Firebase Auth
- Protected routes with React Router
- Family profile management with create, read, update, and delete
- PDF and image report upload
- Gemini-powered report analysis through Firebase Cloud Functions
- Persistent report history in Firestore
- Report detail pages with structured AI explanations
- Read-only share links for profile access
- Firebase Storage support for uploaded files

## React Concepts Demonstrated

- Functional components
- Props and component composition
- State management with `useState`
- Side effects with `useEffect`
- Conditional rendering
- Lists and keys
- Lifting state up
- Controlled components
- Routing with `react-router-dom`
- Global state with Context API
- `useMemo` and `useCallback`
- Lazy backend integration through service modules

## Tech Stack

- React 18
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Firebase Auth
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions
- Google Gemini API
- Zod

## Project Structure

```text
HealthAI-react/
├── functions/
├── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   └── styles/
├── firestore.rules
├── storage.rules
├── firebase.json
└── README.md
```

## CRUD Coverage

- Profiles: Create, Read, Update, Delete
- Reports: Create, Read, Delete
- Share links: Create, Read

## Backend and Persistence

- User accounts are handled by Firebase Authentication
- User, profile, report, and share-link metadata are stored in Firestore
- Uploaded report files are stored in Firebase Storage
- AI analysis runs through a Firebase Cloud Function using Gemini

## Environment Variables

Create a local `.env` file in the project root.

```env
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
VITE_ANALYZE_ENDPOINT=""
```

## Local Setup

1. Install frontend dependencies

```bash
npm install
```

2. Install function dependencies

```bash
cd functions
npm install
cd ..
```

3. Add Firebase environment values to `.env`

4. Start the frontend

```bash
npm run dev
```

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication providers you need
3. Create Cloud Firestore
4. Create Firebase Storage
5. Deploy the rules

```bash
npx firebase-tools deploy --only firestore:rules,storage
```

6. Set the Gemini secret

```bash
npx firebase-tools functions:secrets:set GEMINI_API_KEY
```

7. Deploy the function

```bash
npx firebase-tools deploy --only functions
```

8. Put the deployed function URL into `VITE_ANALYZE_ENDPOINT`

## Scripts

- `npm run dev` starts the Vite development server
- `npm run build` creates the production build
- `npm run preview` previews the production build
- `npm run lint` runs ESLint on the React source

## Demo Walkthrough

1. Explain the problem of scattered and confusing medical reports
2. Show login/signup and protected routes
3. Create or switch a family profile
4. Upload a small report image or PDF
5. Show the Gemini summary and saved report history
6. Open a report detail page
7. Show the share link flow
8. Explain Firebase + Gemini architecture choices

## Viva-Safe Stack Summary

Frontend:
- React, Vite, TypeScript, React Router, Tailwind CSS

Backend services:
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Cloud Functions
- Gemini API for report analysis

## Notes

- The AI summary is assistive and not a medical diagnosis
- Firebase rules in this repo are stricter than the temporary test-mode rules used during setup
- Uploaded files are stored under user-scoped Storage paths to keep access separated
