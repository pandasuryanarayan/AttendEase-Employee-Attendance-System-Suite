# AttendEase — HTML/CSS/JS Client-Side SPA

A lightweight, high-performance **Single Page Application (SPA)** for employee attendance management, leave tracking, and monthly reporting — built with pure **HTML5, Vanilla CSS3, and Modern JavaScript (ES6+)**.

---

## 🚀 Features

### 👤 Employee Portal
- **Interactive Dashboard**: View real-time personal attendance stats, check-in status, and quick action cards.
- **Check-In / Check-Out Widget**: One-click timestamp recording with automatic *Present* or *Late* status calculation and exact hours calculation.
- **Attendance Records**: Personal monthly attendance history filterable by month and year.
- **Leave Request Management**: Submit time-off requests (*Vacation*, *Sick Leave*, *Personal*, *Other*) with status tracking.

### 🛡️ Admin Portal
- **Admin KPI Dashboard**: Live company-wide metrics showing today's present, late, absent, and on-leave counts.
- **Employee Management**: Create, edit, activate/deactivate, and delete employee profiles with a standardized 3-column action layout.
- **Attendance Records & Modal Editor**: Complete attendance history with multi-field filtering (*Employee*, *Date Range*, *Status*) and modal time record editor.
- **Leave Approval System**: Review, approve, or reject employee leave requests with custom reviewer notes.
- **Monthly Analytics & Reports**: Detailed breakdown of employee attendance rates, working hours, printable views (`window.print()`), and table summary totals.

---

## 🛠️ Technology Stack

- **Frontend Core**: HTML5 & Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS Design System with `Plus Jakarta Sans` typography, HSL color tokens, CSS Grid, and Flexbox layouts.
- **Architecture**: Single Page Application (SPA) with client-side hash routing (`window.location.hash`).
- **Data Persistence**: Browser `localStorage` (auto-seeded with initial demo data on first load).

---

## 📁 Directory Structure

```text
html-app/
├── index.html          # Application HTML shell & main SPA container
├── css/
│   └── style.css       # Full CSS design system, layout tokens, and component styles
├── js/
│   └── app.js          # SPA router, state manager, seed data, and rendering engines
└── README.md
```

---

## 📦 Getting Started

### 1. Prerequisites
No build tools, Node.js, or backend servers are required! Works directly in any modern web browser.

### 2. How to Run

#### Option A: Direct File Open
Simply double-click **`index.html`** or drag and drop it into your preferred web browser (Chrome, Firefox, Edge, Safari).

#### Option B: Local Static Server (Recommended)
You can run a local HTTP server using Python or Node.js:

```bash
# Using Python 3:
cd html-app
python3 -m http.server 8000

# Using Node.js npx serve:
npx serve html-app
```
Then visit **`http://localhost:8000`** in your browser.

> 💡 **Note**: On initial launch, sample seed data (Admin user, demo employees, attendance records, and leave requests) is automatically created in browser `localStorage`.

---

## 🔑 Default Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Employee** | `alice@company.com` | `employee123` |
| **Employee** | `bob@company.com` | `employee123` |
| **Employee** | `carol@company.com` | `employee123` |

---

## 🗺️ SPA Hash Routes

| Route | Access | Description |
| :--- | :--- | :--- |
| `#login` | Public | User authentication view |
| `#register` | Public | Employee self-registration |
| `#admin` | Admin | Company-wide dashboard & live stats |
| `#dashboard` | Employee | Personal dashboard & check-in portal |
| `#employees` | Admin | Employee management card grid |
| `#employee-form` | Admin | Add or edit employee details |
| `#admin-attendance` | Admin | Full attendance history & record editor |
| `#attendance` | Employee | Personal attendance history view |
| `#admin-leaves` | Admin | Review pending employee leave requests |
| `#leaves` | Employee | Personal leave request manager |
| `#reports` | Admin | Monthly attendance breakdown report |
