# AttendEase — Flask Employee Attendance System

A modern, full-featured **Flask & SQLite** web application for employee attendance tracking, leave management, and monthly analytics reports.

---

## 🚀 Features

### 👤 Employee Features
- **Dashboard Overview**: View live attendance statistics, check-in status, and recent activity log.
- **One-Click Check-In & Check-Out**: Quick timestamp logging with automatic status determination (*Present* vs. *Late*) and working hours calculation.
- **Attendance History**: View personal monthly attendance records filtered by month and year.
- **Leave Requests**: Submit time-off requests (*Vacation*, *Sick Leave*, *Personal*, *Other*) and monitor approval status.

### 🛡️ Admin Features
- **Admin Dashboard**: Live KPI overview showing today's present, late, absent, and on-leave metrics.
- **Employee Management**: Create, edit, activate/deactivate, and delete employee accounts with standardized 3-column action card layout.
- **Attendance Management**: View all employee attendance records with multi-criteria filtering (*Employee*, *Date Range*, *Status*, *Month/Year*) and edit check-in/out timestamps.
- **Leave Request Review**: Process pending employee leave requests with optional reviewer notes.
- **Analytics & Reports**: Monthly breakdown reports with employee attendance rates, summary KPI cards, printable reports (`window.print()`), and a table summary total footer.

---

## 🛠️ Technology Stack

- **Backend Framework**: [Flask](https://flask.palletsprojects.com/) (Python 3)
- **Database & ORM**: SQLite via [Flask-SQLAlchemy](https://flask-sqlalchemy.palletsprojects.com/)
- **Security & Session**: Werkzeug Security (`generate_password_hash`, `check_password_hash`) & Flask Session
- **Frontend & Styling**: Jinja2 HTML Templates & Vanilla CSS Design System with `Plus Jakarta Sans` typography, HSL color tokens, and responsive layout.

---

## 📁 Directory Structure

```text
flask-app/
├── app.py                   # Application entry point, routes & business logic
├── models.py                # Database schemas (User, Attendance, LeaveRequest)
├── instance/
│   └── attendance.db        # SQLite database (auto-created on first run)
├── static/
│   └── css/
│       └── style.css        # Core CSS design system and components
├── templates/
│   ├── base.html            # Main layout with sidebar & topbar navigation
│   ├── login.html           # Authentication page
│   ├── register.html        # New employee registration
│   ├── admin_dashboard.html # Admin analytics overview
│   ├── employee_dashboard.html # Employee portal & check-in widget
│   ├── employees.html       # Employee management cards
│   ├── employee_form.html  # Create/Edit employee form
│   ├── attendance.html     # Attendance records & filtering
│   ├── leaves.html         # Leave requests & review modal
│   └── reports.html        # Monthly breakdown & printable reports
└── README.md
```

---

## 📦 Setup & Installation

### 1. Prerequisites
- **Python 3.8+** installed on your system.

### 2. Quick Setup

```bash
# Navigate to project directory
cd flask-app

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install required dependencies
pip install flask flask-sqlalchemy werkzeug

# Run the application
python3 app.py
```

Open your browser and navigate to: **`http://localhost:5000`**

> 💡 **Note**: The SQLite database (`attendance.db`) and seed demo data (Admin user, demo employees, check-ins, and leave requests) are automatically initialized on the first run.

---

## 🔑 Default Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@company.com` | `admin123` |
| **Employee** | `john.doe@company.com` | `employee123` |
| **Employee** | `jane.smith@company.com` | `employee123` |

---

## 🗺️ Application Endpoints

| Route | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/` | GET | Public | Redirects to dashboard if logged in, else login page |
| `/login` | GET, POST | Public | User login authentication |
| `/register` | GET, POST | Public | Employee registration |
| `/logout` | GET | Authenticated | Clears user session |
| `/admin` | GET | Admin | Admin overview dashboard |
| `/dashboard` | GET | Employee | Employee portal |
| `/check-in` | POST | Employee | Log check-in timestamp |
| `/check-out` | POST | Employee | Log check-out timestamp & calculate total hours |
| `/employees` | GET | Admin | View employee list |
| `/employees/add` | GET, POST | Admin | Add new employee |
| `/employees/edit/<id>` | GET, POST | Admin | Edit employee details |
| `/employees/toggle/<id>` | POST | Admin | Activate/Deactivate employee account |
| `/employees/delete/<id>` | POST | Admin | Delete employee account |
| `/attendance` | GET | Employee | Personal attendance history |
| `/admin/attendance` | GET | Admin | View & filter all employee attendance |
| `/attendance/edit/<id>` | POST | Admin | Edit check-in/out times & status for a record |
| `/leaves` | GET, POST | Employee | Submit & view personal leave requests |
| `/admin/leaves` | GET | Admin | Review pending leave requests |
| `/leaves/review/<id>` | POST | Admin | Approve or reject a leave request |
| `/reports` | GET | Admin | Monthly attendance breakdown report & print view |