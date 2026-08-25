# AttendEase — Employee Attendance System Suite

AttendEase: A comprehensive Employee Attendance Management System implemented in four distinct architectures (Flask, Vanilla JS, React 19, and native Android) sharing a unified design system.

All three implementations share a unified **Design System** (`Plus Jakarta Sans` typography, HSL color tokens, dark indigo sidebar, vector SVG icon set, and standardized responsive layouts).

---

## 📂 Project Implementations Overview

```text
employee-attendance-system/
├── 🐍 flask-app/      # Server-Side Rendered app with Python, Flask, SQLAlchemy & SQLite
├── 🌐 html-app/       # Client-Side Single Page Application (SPA) with Vanilla HTML/CSS/JS
├── ⚛️ react-app/      # Modern Component-Driven SPA with React 19, Vite & Context API
└── 🤖 android-app/    # Native Android app packaging the EXACT html-app SPA in a WebView shell
```

---

## ⚡ Technical Comparison Matrix

| Aspect / Feature | 🐍 `flask-app` | 🌐 `html-app` | ⚛️ `react-app` | 🤖 `android-app` |
| :--- | :--- | :--- | :--- | :--- |
| **Architecture** | Server-Side Rendered (SSR) | Client-Side SPA | Component-Driven SPA | Native Android shell + embedded `html-app` SPA |
| **Language / Engine** | Python 3 / Jinja2 | JavaScript (ES6+) | React 19 (JSX) | Kotlin + WebView (Chromium) |
| **Build Tooling** | None (Flask Dev Server) | None (Browser Native) | Vite 8 | Gradle 8.9 + Android Gradle Plugin |
| **Persistence Layer** | SQLite Database (`attendance.db`) | Browser `localStorage` | Browser `localStorage` | WebView `localStorage` (DOM storage) |
| **State / Session** | Flask Server Sessions | JS Storage Module | React Context API (`AppContext`) | SPA JS Storage Module |
| **Routing** | Flask Server Routes (`@app.route`) | Hash Router (`window.location.hash`) | Component State Views | Hash Router inside WebView (+ hardware back) |
| **Default Port** | `http://localhost:5000` | `http://localhost:8000` | `http://localhost:5173` | N/A (installable APK, runs offline) |

---

## ✨ Unified Features Across All Implementations

1. **Role-Based Portals**:
   - **Employee Portal**: Live dashboard shift tracker, 1-click Check-In & Check-Out logging, working hours calculation, personal attendance history, and leave request submission.
   - **Admin Portal**: Live KPI metrics (Present, Late, Absent, On-Leave counts), employee account management grid, attendance log filters with modal record editor, leave request approval workflow, and monthly reports.

2. **Standardized User Interface & Sizing**:
   - **Typography**: Google Font `Plus Jakarta Sans` across all buttons, navigation items, cards, and inputs.
   - **Employee Action Cards**: Equal 3-column flex button layout (`Edit`, `Deactivate`/`Activate`, `Delete`).
   - **Attendance Log Filters**: Consistent field ordering (`Employee/Month-Year`, `From Date`, `To Date`, `Status` in last position) with `Apply` and `Clear` buttons.
   - **Monthly Reports Breakdown**: KPI overview cards, printable report layouts (`window.print()`), and table summary totals footers (`<tfoot>`).

---

## 🔑 Default Demo Credentials

Across all 3 applications, use these credentials to log in:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Employee** | `john.doe@company.com` *(Flask)* <br> `alice@company.com` *(HTML/React)* | `employee123` |

---

## 🚀 How to Run Each Project

### 1. 🐍 Flask Application (`flask-app`)

Requires **Python 3.8+**:

```bash
cd flask-app

# Create virtual environment
python3 -m venv venv
source venv/bin/activate       # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-sqlalchemy werkzeug

# Start Flask dev server
python3 app.py
```
> Open **`http://localhost:5000`** in your browser. (The SQLite database auto-seeds on first run).

---

### 2. 🌐 Vanilla HTML/CSS/JS Application (`html-app`)

No dependencies or build tools required:

```bash
cd html-app

# Option A: Run local HTTP server using Python 3:
python3 -m http.server 8000

# Option B: Direct file open
# Simply open index.html in any web browser!
```
> Open **`http://localhost:8000`** in your browser.

---

### 3. ⚛️ React 19 Application (`react-app`)

Requires **Node.js 18+**:

```bash
cd react-app

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
> Open **`http://localhost:5173`** in your browser.

---

## 📄 Documentation Links

Detailed README files for each individual implementation:
- 📖 [Flask App Documentation](file:///home/surya/Documents/Projects/employee-attendance-system%2A/flask-app/README.md)
- 📖 [HTML/CSS/JS SPA Documentation](file:///home/surya/Documents/Projects/employee-attendance-system%2A/html-app/README.md)
- 📖 [React App Documentation](file:///home/surya/Documents/Projects/employee-attendance-system%2A/react-app/README.md)
