# FindIt Campus — Testing Checklist & Quality Verification

Built for the **CodeCraft 2026** Hackathon at **Poona College of Arts, Science & Commerce**.

Use this checklist to verify every feature and requirement in the application.

---

## 1. Authentication & Security
- [x] **Student Registration**: Click "Student Login" > "Register Student". Fill in full name, college, email (`test@poonacollege.edu.in`), and password (min 6 characters). Profile doc is securely created in Firestore under `/users/{uid}`.
- [x] **Student Sign In & Sign Out**: Log out via the header profile icon and sign back in with your credentials.
- [x] **Hackathon Quick-Access**: In the Auth modal, click "Sign In as Judge" or "Sign In as Student" for 1-click evaluation without retyping.
- [x] **Form Validation**: Submitting invalid email or weak password displays a helpful, student-friendly error alert.
- [x] **Protected Reporting**: Unauthenticated users clicking "Submit Report" are prompted to log in before writing to Firestore.

---

## 2. Real-Time Cloud Firestore Sync
- [x] **Report Creation**: Submit a report via "+ Report Item". The submission uses `serverTimestamp()`, client-side image compression, and appears immediately in the feed without manual page refresh.
- [x] **Live Database Updates**: Changes in Firestore propagate in real-time via `onSnapshot` listeners.
- [x] **Error Handling**: Missing permissions or network interruptions trigger structured `FirestoreErrorInfo` handling per security architecture standards.

---

## 3. Smart Lost-and-Found Matching
- [x] **Keyword Normalization & Stemming**: Normalizes case, removes diacritics, and filters out conversational filler words ("the", "in", "near", "my", "found").
- [x] **College Alias Resolution**: "Poona College", "Puna College", and "Poona College of Arts, Science & Commerce" automatically resolve to the same canonical institution.
- [x] **Campus & Spot Fuzzy Match**: Evaluates token Jaccard overlap and Levenshtein distance (e.g. "Library" matches "Main Library").
- [x] **The Classic Poona College Benchmark**:
  - **Lost report**: Blue notebook, Puna College, Library.
  - **Found report**: Blue notebook, Puna College, Main Library, submitted to Staff Room.
  - **Result**: Highlighted as an 85%+ Possible Match with transparent evidence chips explaining the score.
- [x] **Transparent Match Breakdown**: Clicking "Inspect Match" shows exact reasons (same college, matched tokens, proximity score). Matches are never guaranteed—verification is required.

---

## 4. UI/UX & Brand Design
- [x] **Color Palette**: Dark Forest Green (`#133e2b`), Mint Green (`#34d399` / `#10b981`), Warm Cream (`#fbf9f5`), and Coral Red (`#f43f5e`).
- [x] **Custom Logo**: Location pin merged with an optical search lens.
- [x] **Responsive Navigation**:
  - **Mobile (< 1024px)**: Bottom navigation bar with central Floating Action Button (FAB).
  - **Desktop (>= 1024px)**: Sticky top header navigation with quick category pills and search.
- [x] **Feedback States**: Interactive spinners during submission, success confirmations, and empty states.

---

## 5. Privacy & Safe Ownership Claim Flow
- [x] **Private Student Data**: Student emails, phone numbers, and sensitive ID card numbers are hidden from public card displays.
- [x] **Ownership Claim Modal**: Students claim an item by submitting non-public proof details (e.g. lock screen wallpaper, hidden scratches, serial number, notes on page 3).
- [x] **Custody Transparency**: Found items clearly display collection points (Staff Room, College Office, Security Desk, Teacher, With Finder).

---

## 6. PWA & Mobile Installability
- [x] **Web App Manifest**: Configured with `id`, `name`, `short_name: "FindItCampus"`, `standalone` mode, and theme color `#133e2b`.
- [x] **In-App Install Prompt**: Mounts `PWAInstallButton` in the navbar and banner with automatic standalone detection.
- [x] **iOS Safari Guidance**: Provides clear 3-step Add to Home Screen instructions.
- [x] **Offline Resilience**: Service worker precaching + offline status banner.
