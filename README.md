# FindIt Campus — Smart College Lost & Found

> **Built for the CodeCraft 2026 Hackathon**  
> **Poona College of Arts, Science & Commerce, Pune**

FindIt Campus is a mobile-first Progressive Web Application (PWA) and Android-ready platform designed to help students, faculty, and campus staff report lost items, register found belongings, and discover potential matches through intelligent fuzzy text matching.

---

## Key Features

1. **Intelligent Lost & Found Matching Engine**
   - Normalizes text, eliminates common filler words, and resolves college name variations (e.g., *Poona College* vs *Puna College*).
   - Computes Jaccard token overlap and Levenshtein similarity on item names, descriptions, and campus locations.
   - Example: A lost report for *"Blue notebook, Puna College, Library"* automatically matches a found report for *"Blue notebook, Puna College, Main Library, Staff Room"* with transparent reasoning chips.

2. **Real-Time Cloud Firestore Integration**
   - Submissions appear live without needing manual page reloads.
   - Hardened Attribute-Based Access Control (ABAC) Firestore Security Rules prevent unauthorized modifications.

3. **Student Privacy & Safe Verification**
   - Protects student contact information and ID card numbers from public view.
   - Safe **Claim Ownership** modal allows owners to verify belongings by submitting secret identifying details (e.g., lock screen wallpaper, stickers, scratches, internal notes) directly to the campus custodian.

4. **Campus Brand & Modern Mobile-First UI**
   - Palette: Dark Forest Green (`#133e2b`), Mint Green (`#34d399`), Warm Cream (`#fbf9f5`), and Coral Red (`#f43f5e`).
   - Custom SVG logo combining a campus location pin with an optical search lens.
   - Mobile bottom navigation with central floating report button; responsive desktop header.

5. **Installable Android & iOS PWA**
   - Installable directly to Android and desktop via Web App Manifest.
   - Built-in iOS Safari "Add to Home Screen" instructions.
   - Service worker caching with offline connectivity indicators.

---

## Project Structure & File Guide

```
├── firebase-applet-config.json    # Live Firebase project configuration
├── firebase-blueprint.json        # Intermediate schema blueprint for Firestore
├── firestore.rules                # Hardened security rules enforcing user ownership
├── security_spec.md               # Security architecture & "Dirty Dozen" audit spec
├── TESTING_CHECKLIST.md           # Verification checklist for hackathon evaluators
├── LICENSE                        # MIT Open Source License
├── public/
│   └── icon.svg                   # Brand icon (location pin + search symbol)
├── src/
│   ├── types/
│   │   └── index.ts               # Core TypeScript definitions (Report, Match, Claim, User)
│   ├── lib/
│   │   ├── firebase.ts            # Firebase app, auth, and firestore initialization
│   │   ├── firestoreErrors.ts     # Standardized FirestoreErrorInfo error handlers
│   │   ├── matching.ts            # Smart fuzzy matching & keyword extraction engine
│   │   └── demoData.ts            # Poona College sample records & campus locations
│   ├── hooks/
│   │   └── usePWAInstall.ts       # PWA prompt listener & online connectivity detector
│   ├── context/
│   │   ├── AuthContext.tsx        # Firebase Authentication state & quick-guest mode
│   │   └── ReportsContext.tsx     # Real-time Firestore sync & match coordinator
│   ├── components/
│   │   ├── Logo.tsx               # Campus pin + search glass SVG logo
│   │   ├── Navbar.tsx             # Desktop navigation bar & search trigger
│   │   ├── BottomNav.tsx          # Mobile bottom navigation bar with report FAB
│   │   ├── ItemCard.tsx           # Report card with photo, custody tag, and match pill
│   │   ├── MatchModal.tsx         # Side-by-side comparison & algorithm reasoning
│   │   ├── ClaimModal.tsx         # Privacy-preserving secret proof verification
│   │   ├── ReportDetailModal.tsx  # Full item view with photo & custody information
│   │   ├── ReportForm.tsx         # Report form with camera preview & anti-duplicate lock
│   │   ├── AuthModal.tsx          # Student login/registration & judge 1-click access
│   │   ├── TestingChecklistModal.tsx # Interactive evaluator test suite
│   │   ├── HowItWorksModal.tsx    # 3-step student onboarding guide
│   │   ├── PWAInstallButton.tsx   # Cross-platform installation trigger
│   │   └── OfflineIndicator.tsx   # Offline status banner
│   ├── views/
│   │   ├── HomeView.tsx           # Hero banner, match suggestions, category filters
│   │   ├── LostFoundView.tsx      # Filterable directory for Lost or Found items
│   │   └── MyItemsView.tsx        # Personal student dashboard & status manager
│   ├── App.tsx                    # Top-level application component
│   ├── index.css                  # Tailwind CSS theme variables
│   └── main.tsx                   # React 19 entry point
└── vite.config.ts                 # Vite bundler configuration with VitePWA
```

---

## Local Setup & Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

---

## Firebase Configuration

This app connects to Firebase Cloud Firestore and Firebase Authentication.

1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** > Sign-in method > **Email/Password**.
3. Create a **Cloud Firestore** database.
4. Deploy the security rules in `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Place your web configuration in `firebase-applet-config.json`.

---

## Building an Android APK

Because FindIt Campus is built as a standards-compliant Progressive Web App with standalone display configuration, you can package it into a native Android APK:

### Option A: Using Google's Bubblewrap CLI (Recommended)
1. Install Bubblewrap CLI:
   ```bash
   npm install -g @bubblewrap/cli
   ```
2. Initialize from your hosted web app manifest:
   ```bash
   bubblewrap init --manifest="https://your-hosted-app-url/manifest.webmanifest"
   ```
3. Build the signed Android APK:
   ```bash
   bubblewrap build
   ```
This produces an installable Android APK / AAB ready for side-loading or Google Play Store distribution.

### Option B: Using Capacitor
1. Install Capacitor:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npx cap init FindItCampus com.poonacollege.findit
   ```
2. Build the web app and add Android:
   ```bash
   npm run build
   npx cap add android
   npx cap copy
   ```
3. Open in Android Studio to build APK:
   ```bash
   npx cap open android
   ```

---

## Web Deployment

### Deploying to Cloud Run / Vercel / Netlify
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. The `dist/` directory contains all static HTML, JS, CSS, and manifest assets ready to be served by any static host or CDN.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.
