# HealthVault AI

AI-powered health report management for individuals and families.

HealthVault AI is a full-stack React application that helps users organize medical reports, maintain family profiles, and turn complex reports into structured, plain-language explanations using Google Gemini.

## Why I built it

Medical reports are often scattered across PDFs, images, chats, and devices. This project explores how an AI-assisted product can make report history easier to organize and understand while keeping the underlying data structured and shareable.

## Key features

- Email/password and Google authentication
- Family profiles within a single account
- PDF and image report uploads
- Gemini-powered report analysis
- Persistent report history per profile
- Read-only sharing links for doctors or caregivers
- Protected routes and Firebase security rules
- Structured validation with Zod

## Architecture

```text
React + TypeScript + Vite
        │
        ├── Firebase Auth
        ├── Firestore ─────── User / Profile / Report metadata
        ├── Storage ───────── Report files
        │
        └── Cloud Function
                │
                └── Gemini API
                      ↓
             Structured AI explanation
```

## Tech stack

**Frontend:** React 18, TypeScript, Vite, React Router, Tailwind CSS

**Backend / Cloud:** Firebase Cloud Functions, Firestore, Firebase Storage

**AI:** Google Gemini API

**Validation / tooling:** Zod, ESLint

## Engineering highlights

- Separated UI, state, service, and backend concerns instead of putting API logic directly in components.
- Used Cloud Functions as the server-side boundary for Gemini calls.
- Persisted report and family-profile state in Firestore.
- Used protected routes and Firebase rules for access control.
- Used structured validation with Zod.
- Designed AI responses around report-specific structured explanations rather than raw model text.

## Project structure

```text
functions/
src/
├── components/
├── context/
├── lib/
├── pages/
├── services/
└── styles/
firestore.rules
storage.rules
firebase.json
```

## Run locally

```bash
npm install
cd functions && npm install && cd ..
npm run dev
```

Create a `.env` file with the Firebase configuration and configure the Gemini secret for the Cloud Function.

## Firebase setup

1. Create a Firebase project.
2. Enable the required Authentication providers.
3. Create Firestore and Storage.
4. Configure the Firebase environment variables.
5. Deploy Firestore and Storage rules.
6. Set the Gemini secret for the Cloud Function.
7. Deploy the function.

```bash
npx firebase-tools deploy --only firestore:rules,storage
npx firebase-tools functions:secrets:set GEMINI_API_KEY
npx firebase-tools deploy --only functions
```

## Demo

Video demo: https://drive.google.com/file/d/1UZj9mOtcpI2tLZfRnCrRIkIWg1TBLJU0/view?usp=sharing

## Disclaimer

This is a software project for organizing and explaining medical reports. AI-generated explanations are not medical diagnoses or a replacement for professional medical advice.
