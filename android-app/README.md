# AttendEase — Native Android App

The AttendEase Employee Attendance System packaged as a **real, installable Android application** (`.apk`). This project embeds the **exact** `html-app/` Single Page Application — same design system, same implementation, every feature — inside a native Android WebView shell with first-class native integrations.

> **Design parity is 100% by construction**: the APK bundles the identical `index.html`, `css/style.css` and `js/app.js` that ship in `html-app/` (copied into `app/src/main/assets/`), so every screen, color token, animation, filter, modal, payroll rule and invoice renders pixel-identically on Android.

---

## 📱 What You Get

| Native Android layer | What it does |
| :--- | :--- |
| **Branded cold-start splash** | Indigo → violet brand gradient (`#6366F1 → #A855F7`) with the AttendEase calendar glyph, mirrored from `favicon.svg`. |
| **Adaptive launcher icon** | Same gradient + glyph composition, with monochrome support for themed icons (Android 13+). |
| **System bars blended** | Status/navigation bars matched to the SPA's white topbar with light icons. |
| **Hardware back button / gesture nav** | Walks the SPA's hash history (`#login → #dashboard → #leaves → …`) before exiting. |
| **Native print sheet** | The SPA's `window.print()` calls (Monthly Report, Payslips, Tax Invoice view) are bridged through `PrintBridge` into the Android system print dialog — print to any printer or **Save as PDF**, honoring the app's `@media print` A4 stylesheet. |
| **Persistent storage** | WebView DOM storage (`localStorage`) is enabled, so users, attendance, leaves, salaries, invoices, payroll rules and the session **survive app restarts** exactly like the browser version. |
| **Rotation / multitasking safe** | `configChanges` handling + WebView state save/restore — no data loss on rotate or split-screen. |
| **Works offline** | The entire application is bundled in `/assets`. Internet is only used to fetch the `Plus Jakarta Sans` / `Inter` Google Fonts (falls back to system Roboto when offline). |

### ✨ Feature Parity with `html-app/`

Everything the HTML app does, the Android app does — same code:

- **Employee Portal** — dashboard with live shift clock, 1-click Check-In / Check-Out (Present/Late auto-detection, exact hours), personal attendance history, leave requests (Vacation / Sick / Personal / Other), My Payslips & Tax Invoices portal.
- **Admin Portal** — live KPI dashboard (Present / Late / Absent / On-Leave), employee management (create, edit, activate/deactivate, delete), attendance records with multi-field filters + modal editor, leave approval workflow, monthly analytics & reports with summary totals.
- **Payroll Engine** — Run Monthly Payroll console, Invoices & Salary Register (12-column table, KPI cards, Mark Paid modal with `TXN` refs, Delete Batch modal with 4-digit captcha), and the full 7-tab Payroll Policy & Rules Console (salary structure, deductions/TDS, LOP & overtime, priority cascade, category profiles, test simulation, branding & entity).
- **Printable Tax Invoice** — official A4 salary certificate via the Android print sheet.

---

## 📁 Project Structure

```text
android-app/
├── settings.gradle.kts              # Gradle project settings (repositories, module include)
├── build.gradle.kts                 # Root build file (AGP + Kotlin plugins)
├── gradle.properties                # JVM args, AndroidX flags
├── gradlew / gradlew.bat            # Gradle wrapper launchers
├── gradle/wrapper/
│   └── gradle-wrapper.properties    # Gradle 8.9 distribution
└── app/
    ├── build.gradle.kts             # Android module: SDK levels, dependencies
    ├── proguard-rules.pro           # Keeps the JS bridge in release builds
    └── src/main/
        ├── AndroidManifest.xml      # Permissions, theme, MainActivity
        ├── assets/                  # ← the EXACT html-app, bundled verbatim
        │   ├── index.html           #    SPA shell (sidebar, topbar, router mount)
        │   ├── css/style.css        #    Full design system (tokens, layout, print CSS)
        │   ├── js/app.js            #    Router, state, seed data, payroll engine, views
        │   └── favicon.svg
        ├── java/com/attendease/android/
        │   ├── MainActivity.kt      # WebView host: JS + DOM storage, back nav, print hook
        │   └── PrintBridge.kt       # @JavascriptInterface → Android PrintManager
        └── res/
            ├── layout/activity_main.xml        # WebView + top loading bar
            ├── values/                         # colors.xml (CSS tokens), strings, themes
            ├── values-night/themes.xml
            ├── drawable/                       # brand gradient, splash, calendar glyph vectors
            ├── mipmap-anydpi-v26/              # adaptive launcher icons
            └── xml/                            # backup / data-extraction rules
```

---

## 🛠️ Build & Install

### Prerequisites
- **Android Studio** (Ladybug or newer recommended) with Android SDK 35, or
- Command line: JDK 17 + Android SDK with `ANDROID_HOME` set.

### Option A — Android Studio (recommended)
1. Open Android Studio → **File ▸ Open** → select the `android-app/` folder.
2. Let Gradle sync finish (Studio downloads Gradle 8.9 and dependencies automatically).
3. Press **Run ▶** on any device/emulator running **Android 8.0 (API 26)+**.

### Option B — Command line
```bash
cd android-app

# First time only: the wrapper jar is not committed, generate it once
# (requires any local Gradle ≥ 8.x, or Android Studio will do this for you):
gradle wrapper --gradle-version 8.9

# Build a debug APK:
./gradlew assembleDebug

# Install on a connected device:
./gradlew installDebug
# APK output: app/build/outputs/apk/debug/app-debug.apk
```

### Option C — Release AAB/APK
```bash
./gradlew assembleRelease        # unsigned; sign with your keystore before publishing
```

| Build config | Value |
| :--- | :--- |
| `applicationId` | `com.attendease.android` |
| `minSdk` | 24 (Android 7.0) |
| `targetSdk` / `compileSdk` | 35 (Android 15) |
| Gradle / AGP / Kotlin | 8.9 / 8.7.x / 2.0.x |
| Dependencies | `androidx.core`, `appcompat`, `material`, `activity-ktx`, `webkit`, `swiperefreshlayout` |

---

## 🔑 Demo Login Credentials

The app seeds itself with the same demo data on first launch (stored in the WebView's `localStorage`):

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Employee** | `alice@company.com` | `employee123` |
| **Employee** | `bob@company.com` | `employee123` |
| **Employee** | `carol@company.com` | `employee123` |

---

## ⚙️ How the Native Integration Works

```
┌──────────────────────────── Android APK ────────────────────────────┐
│  MainActivity.kt                                                     │
│  ├── WebView (JavaScript + DOM storage enabled)                      │
│  │    └── assets/index.html ── style.css + app.js  (≡ html-app/)     │
│  │         ├── hash router (#login, #dashboard, #invoices, …)       │
│  │         ├── localStorage persistence (eas_users, eas_invoices…)  │
│  │         └── window.print() ──rewritten on page load──┐           │
│  ├── OnBackPressedCallback ── webView.canGoBack()/goBack()          │
│  └── PrintBridge (@JavascriptInterface)  ◄──────────────┘           │
│        └── PrintManager + WebView.createPrintDocumentAdapter()       │
│             → Android system print sheet / Save-as-PDF               │
└──────────────────────────────────────────────────────────────────────┘
```

- **Why WebView?** The requirement is an *exact* copy of the html-app — design **and** implementation. Embedding the identical SPA guarantees every screen behaves exactly like the reference app, while the Kotlin shell supplies the platform integrations a plain browser tab can't (back navigation, system print sheet, launcher presence, splash, offline bundle).
- **Keeping assets in sync**: if you change `html-app/`, copy the three files back into `app/src/main/assets/` (`index.html`, `css/style.css`, `js/app.js`) and rebuild.
- **Resetting demo data**: Android Settings ▸ Apps ▸ AttendEase ▸ Storage ▸ Clear Storage (this wipes the WebView's `localStorage` and re-seeds on next launch).

---

## 📁 Sibling Implementations

| Folder | Stack |
| :--- | :--- |
| `flask-app/` | Python / Flask / SQLAlchemy / SQLite (server-rendered) |
| `html-app/` | Vanilla HTML/CSS/JS SPA — **the reference this app packages** |
| `react-app/` | React 19 + Vite SPA |
| `android-app/` | **This project** — native Android shell around the exact html-app |
