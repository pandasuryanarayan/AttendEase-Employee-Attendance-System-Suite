# AttendEase — React Employee Attendance System

A modern, high-performance Employee Attendance Management System built with **React 19**, **Vite**, **Context API**, and a custom **Vanilla CSS Design System**.

---

## ✨ Key Features

### 👤 Employee Portal
- **Dashboard Overview**: Live shift status banner, 1-click Check-In / Check-Out actions, working hours counter, and recent check-in log.
- **Attendance History**: Monthly attendance records filterable by month and year.
- **Leave Requests**: Submit time-off requests (*Vacation*, *Sick Leave*, *Personal*, *Other*) with status tracking.

### 🛡️ Admin Portal
- **Admin Dashboard**: Real-time KPI statistics cards (Present, Late, Absent, On Leave) and quick action shortcuts.
- **Employee Management**: Search, department filtering, employee creation, modal profile editor, status toggle, and account deletion with standardized 3-column action card layout.
- **Attendance Records**: Full attendance history with multi-criteria filtering (*Employee*, *Date Range*, *Status* in last position), `Apply` / `Clear` buttons, and modal check-in/out timestamp editor.
- **Leave Request Review**: Process pending employee leave requests with optional reviewer notes.
- **Analytics & Reports**: Monthly employee breakdown with summary KPI cards, printable reports (`window.print()`), and a table footer summary total row (`<tfoot>`).

### 🎨 Design & UI Highlights
- **Standardized Vector SVG Icon Suite** ([`src/components/Icons.jsx`](file:///home/surya/Documents/Projects/employee-attendance-system%2A/react-app/src/components/Icons.jsx)): Lightweight, zero-dependency SVG vector icons matching `html-app` and `flask-app`.
- **Typography & Theme**: Built on `Plus Jakarta Sans` typography, HSL color space tokens, responsive dark-mode sidebar (`#0f172a` to `#1e1b4b`), and fluid layout containers.

---

## 🔑 Default Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Employee** | `alice@company.com` | `employee123` |
| **Employee** | `bob@company.com` | `employee123` |
| **Employee** | `carol@company.com` | `employee123` |

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/) & JSX
- **Build Tool & Dev Server**: [Vite](https://vitejs.dev/)
- **State Management**: React Context API ([`AppContext.jsx`](file:///home/surya/Documents/Projects/employee-attendance-system%2A/react-app/src/context/AppContext.jsx))
- **Styling**: Vanilla CSS Design Tokens, CSS Grid, Flexbox, and Glassmorphic Containers
- **Data Persistence**: Browser `localStorage` auto-initialized with mock seed data ([`initialData.js`](file:///home/surya/Documents/Projects/employee-attendance-system%2A/react-app/src/data/initialData.js))

---

## 📁 Project Structure

```text
react-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                 # Application entry point
    ├── App.jsx                  # Main page router & layout shell
    ├── index.css                # CSS design system, typography & utilities
    ├── components/
    │   ├── Icons.jsx            # Centralized SVG vector icons component suite
    │   ├── Sidebar.jsx          # Collapsible responsive sidebar navigation
    │   ├── Topbar.jsx           # Main page top header bar
    │   ├── Modal.jsx            # Reusable popup dialog modal
    │   └── FlashAlerts.jsx      # Toast notification system
    ├── context/
    │   └── AppContext.jsx       # Global application state & localStorage sync
    ├── data/
    │   └── initialData.js       # Seed mock dataset (Users, Attendance, Leaves)
    └── pages/
        ├── Login.jsx            # Sign-in page with quick 1-click demo buttons
        ├── Register.jsx         # New employee self-registration page
        ├── AdminDashboard.jsx   # Admin statistics overview page
        ├── EmployeeDashboard.jsx# Employee portal & check-in widget page
        ├── EmployeeManagement.jsx # Employee grid, filter bar & management
        ├── EmployeeFormModal.jsx# Create/Edit employee modal
        ├── AttendanceRecords.jsx# Attendance logs, filters & edit modal
        ├── LeaveRequests.jsx    # Leave requests submission & review page
        └── Reports.jsx          # Monthly analytics, print view & totals footer
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation & Running Locally

```bash
# Navigate to react-app directory
cd react-app

# Install project dependencies
npm install

# Start local Vite development server
npm run dev
```

Open your browser at: **`http://localhost:5173`**

### 3. Production Build & Preview

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```
