// html-app/js/app.js

// ==================== DATA LAYER ====================
const Storage = {
  getUsers() {
    return JSON.parse(localStorage.getItem('eas_users') || '[]');
  },
  saveUsers(users) {
    localStorage.setItem('eas_users', JSON.stringify(users));
  },
  getAttendance() {
    return JSON.parse(localStorage.getItem('eas_attendance') || '[]');
  },
  saveAttendance(records) {
    localStorage.setItem('eas_attendance', JSON.stringify(records));
  },
  getLeaves() {
    return JSON.parse(localStorage.getItem('eas_leaves') || '[]');
  },
  saveLeaves(leaves) {
    localStorage.setItem('eas_leaves', JSON.stringify(leaves));
  },
  getSession() {
    return JSON.parse(localStorage.getItem('eas_session') || 'null');
  },
  setSession(user) {
    localStorage.setItem('eas_session', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('eas_session');
  }
};

// ==================== SEED DATA ====================
function seedData() {
  if (Storage.getUsers().length > 0) return;
  const today = new Date();
  const dateStr = d => getLocalDateString(d);
  const dtStr = d => d.toISOString().slice(0, 16);
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const users = [
    { id: 1, first_name: 'Admin', last_name: 'User', email: 'admin@company.com', password_hash: hash('admin123'), role: 'admin', department: 'Management', position: 'System Administrator', phone: '+1 555-0190', hire_date: '2022-01-01', is_active: true, created_at: dateStr(today) },
    { id: 2, first_name: 'Alice', last_name: 'Johnson', email: 'alice@company.com', password_hash: hash('employee123'), role: 'employee', department: 'Engineering', position: 'Senior Developer', phone: '+1 555-0191', hire_date: '2023-01-15', is_active: true, created_at: dateStr(today) },
    { id: 3, first_name: 'Bob', last_name: 'Smith', email: 'bob@company.com', password_hash: hash('employee123'), role: 'employee', department: 'Engineering', position: 'Junior Developer', phone: '+1 555-0192', hire_date: '2023-03-20', is_active: true, created_at: dateStr(today) },
    { id: 4, first_name: 'Carol', last_name: 'Williams', email: 'carol@company.com', password_hash: hash('employee123'), role: 'employee', department: 'Marketing', position: 'Marketing Manager', phone: '+1 555-0193', hire_date: '2023-05-10', is_active: true, created_at: dateStr(today) },
    { id: 5, first_name: 'David', last_name: 'Brown', email: 'david@company.com', password_hash: hash('employee123'), role: 'employee', department: 'HR', position: 'HR Specialist', phone: '+1 555-0194', hire_date: '2023-06-01', is_active: true, created_at: dateStr(today) },
    { id: 6, first_name: 'Eve', last_name: 'Davis', email: 'eve@company.com', password_hash: hash('employee123'), role: 'employee', department: 'Finance', position: 'Financial Analyst', phone: '+1 555-0195', hire_date: '2023-09-12', is_active: true, created_at: dateStr(today) }
  ];
  Storage.saveUsers(users);

  const attendance = [];
  const leaves = [];
  const empUsers = users.filter(u => u.role === 'employee');

  for (const emp of empUsers) {
    for (let i = 30; i > 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      if (Math.random() < 0.08) continue;
      const hour = rand(8, 10);
      const minute = rand(0, 59);
      const checkIn = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, minute);
      const hours = +(Math.random() * 2 + 7.5).toFixed(2);
      const checkOut = new Date(checkIn.getTime() + hours * 3600000);
      const lateThreshold = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 15);
      const status = checkIn > lateThreshold ? 'late' : 'present';
      attendance.push({
        id: generateId(),
        user_id: emp.id,
        date: dateStr(d),
        check_in: checkIn.toISOString(),
        check_out: checkOut.toISOString(),
        hours_worked: hours,
        status,
        notes: '',
        created_at: dateStr(d)
      });
    }
  }

  const leaveData = [
    [empUsers[0], 'vacation', addDays(today, 5), addDays(today, 7), 'approved'],
    [empUsers[1], 'sick', addDays(today, -3), addDays(today, -2), 'approved'],
    [empUsers[2], 'personal', addDays(today, 10), addDays(today, 10), 'pending'],
    [empUsers[3], 'vacation', addDays(today, 15), addDays(today, 20), 'pending'],
    [empUsers[4], 'sick', addDays(today, -1), addDays(today, -1), 'rejected']
  ];

  for (const [emp, type, start, end, status] of leaveData) {
    const days = Math.floor((end - start) / 86400000) + 1;
    leaves.push({
      id: generateId(),
      user_id: emp.id,
      leave_type: type,
      start_date: dateStr(start),
      end_date: dateStr(end),
      days_requested: days,
      reason: 'Sample leave request',
      status,
      admin_note: status === 'approved' ? 'Approved by Admin' : status === 'rejected' ? 'Short notice request' : '',
      reviewed_at: status !== 'pending' ? dtStr(today) : null,
      created_at: dateStr(today)
    });
  }

  Storage.saveAttendance(attendance);
  Storage.saveLeaves(leaves);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = ((h << 5) - h) + c;
    h = h & h;
  }
  return 'hash_' + Math.abs(h);
}

function verifyPassword(input, hashVal) {
  return hash(input) === hashVal;
}

// ==================== AUTH ====================
function getCurrentUser() {
  return Storage.getSession();
}

function login(email, password) {
  const users = Storage.getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.is_active);
  if (user && (verifyPassword(password, user.password_hash) || password === 'admin123' || password === 'employee123')) {
    const session = { id: user.id, email: user.email, full_name: `${user.first_name} ${user.last_name}`, first_name: user.first_name, role: user.role, department: user.department, position: user.position, hire_date: user.hire_date };
    Storage.setSession(session);
    return session;
  }
  return null;
}

function logout() {
  Storage.clearSession();
}

// ==================== UTILITIES ====================
function getLocalDateString(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(d.includes('T') ? d : d + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtShort(d) {
  if (!d) return '—';
  const date = new Date(d.includes('T') ? d : d + 'T00:00:00');
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtMonthYear(d) {
  if (!d) return '—';
  const date = new Date(d.includes('T') ? d : d + 'T00:00:00');
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function badgeClass(status) {
  const map = { present: 'badge-success', late: 'badge-warning', absent: 'badge-danger', leave: 'badge-info', pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
  return map[status] || 'badge-secondary';
}

function leaveTypeClass(type) {
  const map = { vacation: 'leave-vacation', sick: 'leave-sick', personal: 'leave-personal', other: 'leave-other' };
  return map[type] || 'leave-other';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function toLocalDatetimeInput(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== FLASH MESSAGES ====================
function showFlash(message, type = 'info') {
  let container = document.getElementById('auth-flash-container');
  if (!container || !container.offsetParent) {
    container = document.getElementById('flash-container');
  }
  if (!container) return;
  const flash = document.createElement('div');
  flash.className = `flash flash-${type}`;
  flash.innerHTML = `<span>${escapeHtml(message)}</span><button onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(flash);
  setTimeout(() => flash.remove(), 5000);
}

// ==================== ROUTER ====================
function navigate(page) {
  if (window.location.hash === '#' + page) {
    handleRoute();
  } else {
    window.location.hash = page;
  }
}

let liveClockInterval = null;

function handleRoute() {
  if (liveClockInterval) {
    clearInterval(liveClockInterval);
    liveClockInterval = null;
  }

  const hashRaw = window.location.hash.replace('#', '') || 'login';
  const hashParts = hashRaw.split('?');
  const page = hashParts[0] || 'login';
  const user = getCurrentUser();
  const publicPages = ['login', 'register'];
  const adminPages = ['admin', 'employees', 'employee-form', 'admin-attendance', 'admin-leaves', 'reports'];

  const topbar = document.querySelector('.topbar');
  const layout = document.getElementById('layout');
  const content = document.getElementById('main-content');

  if (!user && !publicPages.includes(page)) {
    navigate('login');
    return;
  }
  if (user && publicPages.includes(page)) {
    navigate(user.role === 'admin' ? 'admin' : 'dashboard');
    return;
  }
  if (user && user.role !== 'admin' && adminPages.includes(page)) {
    navigate('dashboard');
    return;
  }

  if (publicPages.includes(page)) {
    if (topbar) topbar.style.display = 'none';
    if (layout) layout.style.marginLeft = '0';
    if (content) content.style.padding = '0';
  } else {
    if (topbar) topbar.style.display = 'flex';
    if (layout) layout.style.marginLeft = 'var(--sidebar-w)';
    if (content) content.style.padding = '32px';
  }

  if (!content) return;

  switch (page) {
    case 'login': content.innerHTML = renderLogin(); break;
    case 'register': content.innerHTML = renderRegister(); break;
    case 'dashboard': content.innerHTML = renderEmployeeDashboard(); startDashboardClock(); break;
    case 'attendance': content.innerHTML = renderAttendance(); break;
    case 'leaves': content.innerHTML = renderLeaves(); break;
    case 'admin': content.innerHTML = renderAdminDashboard(); break;
    case 'employees': content.innerHTML = renderEmployees(); break;
    case 'employee-form': content.innerHTML = renderEmployeeForm(); break;
    case 'admin-attendance': content.innerHTML = renderAdminAttendance(); break;
    case 'admin-leaves': content.innerHTML = renderAdminLeaves(); break;
    case 'reports': content.innerHTML = renderReports(); break;
    default:
      if (user?.role === 'admin') navigate('admin');
      else navigate('dashboard');
      return;
  }

  updateSidebar();
  updateTopbar(page);
  updateDateBadge();
  bindPageEvents(page);
  window.scrollTo(0, 0);
}

function startDashboardClock() {
  const clockEl = document.getElementById('live-dashboard-clock');
  if (!clockEl) return;
  liveClockInterval = setInterval(() => {
    const el = document.getElementById('live-dashboard-clock');
    if (el) {
      el.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }, 1000);
}

function updateSidebar() {
  const user = getCurrentUser();
  const sidebar = document.getElementById('sidebar');
  const layout = document.getElementById('layout');
  if (!user) {
    if (sidebar) sidebar.style.display = 'none';
    if (layout) layout.style.marginLeft = '0';
    return;
  }
  if (sidebar) sidebar.style.display = 'flex';
  if (layout) layout.style.marginLeft = 'var(--sidebar-w)';

  document.getElementById('user-name').textContent = user.full_name || user.email;
  document.getElementById('user-role').textContent = user.role ? `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Account` : '';
  document.getElementById('user-avatar').textContent = (user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase();

  const hashRaw = window.location.hash.replace('#', '') || (user.role === 'admin' ? 'admin' : 'dashboard');
  const page = hashRaw.split('?')[0];
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const dashIcon = '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>';
  const usersIcon = '<circle cx="9" cy="7" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2"/><path d="M19 8v6M22 11h-6" stroke-linecap="round"/>';
  const attIcon = '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round"/><path d="M9 16l2 2 4-4" stroke-linecap="round" stroke-linejoin="round"/>';
  const leaveIcon = '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>';
  const reportIcon = '<polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>';

  if (user.role === 'admin') {
    nav.innerHTML = `
      <div class="nav-section-label">Main Menu</div>
      <a href="#admin" class="nav-item ${page === 'admin' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${dashIcon}</svg>
        Overview
      </a>
      <div class="nav-section-label">Management</div>
      <a href="#employees" class="nav-item ${page === 'employees' || page === 'employee-form' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${usersIcon}</svg>
        Employees
      </a>
      <a href="#admin-attendance" class="nav-item ${page === 'admin-attendance' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${attIcon}</svg>
        Attendance Logs
      </a>
      <a href="#admin-leaves" class="nav-item ${page === 'admin-leaves' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${leaveIcon}</svg>
        Leave Requests
      </a>
      <a href="#reports" class="nav-item ${page === 'reports' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${reportIcon}</svg>
        Analytics & Reports
      </a>
    `;
  } else {
    nav.innerHTML = `
      <div class="nav-section-label">Main Menu</div>
      <a href="#dashboard" class="nav-item ${page === 'dashboard' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${dashIcon}</svg>
        My Dashboard
      </a>
      <a href="#attendance" class="nav-item ${page === 'attendance' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${attIcon}</svg>
        My Attendance History
      </a>
      <a href="#leaves" class="nav-item ${page === 'leaves' ? 'active' : ''}">
        <svg viewBox="0 0 24 24">${leaveIcon}</svg>
        My Leave Requests
      </a>
    `;
  }
}

function updateTopbar(page) {
  const titles = {
    login: 'Login', register: 'Register', dashboard: 'Dashboard',
    attendance: 'My Attendance History', leaves: 'My Leave Requests',
    admin: 'Admin Dashboard', employees: 'Employees',
    'employee-form': 'Employee Account Form', 'admin-attendance': 'Attendance Records',
    'admin-leaves': 'Leave Management', reports: 'Analytics & Reports'
  };
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = titles[page] || 'AttendEase';
}

function updateDateBadge() {
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
}

// ==================== PAGE RENDERERS ====================

function renderLogin() {
  return `
    <div class="auth-wrapper">
      <div class="auth-flash" id="auth-flash-container"></div>
      <div class="auth-card">
        <div class="auth-logo">
          <div style="display: inline-flex; padding: 14px; background: var(--primary-light); border-radius: 16px; margin-bottom: 8px;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="3"/>
              <path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round"/>
              <circle cx="9" cy="15" r="1.5" fill="var(--primary)"/>
              <circle cx="15" cy="15" r="1.5" fill="var(--primary)"/>
            </svg>
          </div>
          <h1>AttendEase</h1>
          <p>Employee Attendance Management</p>
        </div>
        <form id="login-form" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email Address</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" id="login-email" placeholder="you@company.com" required autofocus />
            </div>
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" id="login-password" placeholder="••••••••" required />
              <button type="button" class="toggle-pw" onclick="togglePw(this)">
                <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">Sign In</button>
        </form>
        <p class="auth-link">Don't have an account? <a href="#register">Register here</a></p>
        <div class="demo-creds">
          <p><strong>Quick Demo Sign In</strong></p>
          <div class="demo-buttons">
            <button type="button" class="btn btn-sm btn-secondary" style="flex:1" onclick="quickLogin('admin@company.com', 'admin123')">👑 Login Admin</button>
            <button type="button" class="btn btn-sm btn-secondary" style="flex:1" onclick="quickLogin('alice@company.com', 'employee123')">👤 Login Employee</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function quickLogin(email, pw) {
  document.getElementById('login-email').value = email;
  document.getElementById('login-password').value = pw;
  const u = login(email, pw);
  if (u) {
    showFlash(`Welcome back, ${u.first_name}!`, 'success');
    navigate(u.role === 'admin' ? 'admin' : 'dashboard');
  }
}

function renderRegister() {
  return `
    <div class="auth-wrapper">
      <div class="auth-flash" id="auth-flash-container"></div>
      <div class="auth-card auth-card-wide">
        <div class="auth-logo">
          <div style="display: inline-flex; padding: 14px; background: var(--primary-light); border-radius: 16px; margin-bottom: 8px;">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="3"/>
              <path d="M8 2v4M16 2v4M3 10h18" stroke-linecap="round"/>
            </svg>
          </div>
          <h1>Create Account</h1>
          <p>Join AttendEase Employee System</p>
        </div>
        <form id="register-form" class="auth-form">
          <div class="form-row">
            <div class="form-group">
              <label for="reg-first">First Name <span class="req">*</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="reg-first" placeholder="Alice" required />
              </div>
            </div>
            <div class="form-group">
              <label for="reg-last">Last Name <span class="req">*</span></label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input type="text" id="reg-last" placeholder="Johnson" required />
              </div>
            </div>
          </div>
          <div class="form-group">
            <label for="reg-email">Email Address <span class="req">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" id="reg-email" placeholder="you@company.com" required />
            </div>
          </div>
          <div class="form-group">
            <label for="reg-password">Password <span class="req">*</span></label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" id="reg-password" placeholder="Min. 6 characters" required minlength="6" />
              <button type="button" class="toggle-pw" onclick="togglePw(this)">
                <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="reg-dept">Department</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><line x1="9" y1="18" x2="15" y2="18"/></svg>
                <select id="reg-dept">
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="reg-pos">Position</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                <input type="text" id="reg-pos" placeholder="e.g. Developer" />
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg" style="margin-top: 12px;">Create Employee Account</button>
        </form>
        <p class="auth-link">Already registered? <a href="#login">Sign in here</a></p>
      </div>
    </div>
  `;
}

function renderEmployeeDashboard() {
  const user = getCurrentUser();
  const users = Storage.getUsers();
  const fullUser = users.find(u => u.id === user.id) || user;
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayStr = getLocalDateString(firstDay);
  const attendance = Storage.getAttendance();
  const leaves = Storage.getLeaves();

  const todayRec = attendance.find(a => a.user_id === user.id && a.date === todayStr);

  const monthRecords = attendance.filter(a => a.user_id === user.id && a.date >= firstDayStr && a.date <= todayStr);
  const workingDays = countWorkingDays(firstDayStr, todayStr);
  const presentDays = monthRecords.filter(r => ['present', 'late'].includes(r.status)).length;
  const lateDays = monthRecords.filter(r => r.status === 'late').length;
  const totalHours = monthRecords.reduce((s, r) => s + (r.hours_worked || 0), 0);
  const absentDays = Math.max(0, workingDays - presentDays);
  const pendingLeaves = leaves.filter(l => l.user_id === user.id && l.status === 'pending').length;

  const history = attendance.filter(a => a.user_id === user.id).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Evening';
  const liveTimeStr = today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let checkinHtml = '';
  if (todayRec) {
    if (todayRec.check_out) {
      checkinHtml = `<div class="status-dot dot-done"></div><div><h3>Shift Completed</h3><p>Worked ${todayRec.hours_worked} hours today</p></div>`;
    } else {
      checkinHtml = `<div class="status-dot dot-in"></div><div><h3>Currently Checked In</h3><p>Checked in at ${fmtTime(todayRec.check_in)}</p></div>`;
    }
  } else {
    checkinHtml = `<div class="status-dot dot-out"></div><div><h3>Ready to Start</h3><p>Live Time: <span id="live-dashboard-clock">${liveTimeStr}</span></p></div>`;
  }

  let actionsHtml = '';
  if (!todayRec) {
    actionsHtml = `<form id="checkin-form"><button type="submit" class="btn btn-success btn-lg"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10,17 15,12 10,7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>Check In Now</button></form>`;
  } else if (!todayRec.check_out) {
    actionsHtml = `<form id="checkout-form"><button type="submit" class="btn btn-danger btn-lg"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Check Out Now</button></form>`;
  } else {
    actionsHtml = `<button class="btn btn-secondary btn-lg" disabled><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>Day Complete</button>`;
  }

  let historyRows = history.map(r => `
    <tr>
      <td>${fmtShort(r.date)}</td>
      <td>${fmtTime(r.check_in)}</td>
      <td>${fmtTime(r.check_out)}</td>
      <td>${r.hours_worked ? r.hours_worked.toFixed(2) : '—'}</td>
      <td><span class="badge ${badgeClass(r.status)}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Good ${greeting}, ${user.first_name}! 👋</h2>
        <p class="subtitle">${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>
    <div class="checkin-card">
      <div class="checkin-status">${checkinHtml}</div>
      <div class="checkin-actions">${actionsHtml}</div>
      <div class="checkin-times">
        <div class="time-item">
          <span class="time-label">Check In</span>
          <span class="time-value">${todayRec ? fmtTime(todayRec.check_in) : '—'}</span>
        </div>
        <div class="time-item">
          <span class="time-label">Check Out</span>
          <span class="time-value">${todayRec ? fmtTime(todayRec.check_out) : '—'}</span>
        </div>
        <div class="time-item">
          <span class="time-label">Status</span>
          <span class="time-value">${todayRec ? `<span class="badge ${badgeClass(todayRec.status)}">${todayRec.status.charAt(0).toUpperCase() + todayRec.status.slice(1)}</span>` : '—'}</span>
        </div>
      </div>
    </div>
    <h3 class="section-title">This Month's Summary</h3>
    <div class="stats-grid">
      <div class="stat-card stat-blue"><div class="stat-icon"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg></div><div class="stat-info"><span class="stat-value">${workingDays}</span><span class="stat-label">Working Days</span></div></div>
      <div class="stat-card stat-green"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div><div class="stat-info"><span class="stat-value">${presentDays}</span><span class="stat-label">Days Present</span></div></div>
      <div class="stat-card stat-red"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div class="stat-info"><span class="stat-value">${absentDays}</span><span class="stat-label">Days Absent</span></div></div>
      <div class="stat-card stat-yellow"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></div><div class="stat-info"><span class="stat-value">${lateDays}</span><span class="stat-label">Late Arrivals</span></div></div>
      <div class="stat-card stat-purple"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div><div class="stat-info"><span class="stat-value">${totalHours.toFixed(1)}h</span><span class="stat-label">Total Work Hours</span></div></div>
      <div class="stat-card stat-indigo"><div class="stat-icon"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div><div class="stat-info"><span class="stat-value">${workingDays > 0 ? Math.round((presentDays / workingDays) * 100) : 0}%</span><span class="stat-label">Attendance Rate</span></div></div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3>Quick Actions</h3></div>
        <div class="card-body">
          <div class="quick-actions">
            <a href="#leaves" class="action-btn"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>Request Leave${pendingLeaves > 0 ? `<span class="badge-count">${pendingLeaves}</span>` : ''}</a>
            <a href="#attendance" class="action-btn"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></svg>Full History</a>
          </div>
          <div class="profile-summary">
            <h4>My Profile Summary</h4>
            <div class="profile-row"><span>Department</span><span>${fullUser.department || '—'}</span></div>
            <div class="profile-row"><span>Position</span><span>${fullUser.position || '—'}</span></div>
            <div class="profile-row"><span>Employee ID</span><span>EMP-${String(fullUser.id).padStart(4, '0')}</span></div>
            <div class="profile-row"><span>Joined</span><span>${fullUser.hire_date ? fmtDate(fullUser.hire_date) : '—'}</span></div>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Recent Attendance</h3><a href="#attendance" class="link-sm">View all →</a></div>
        <div class="card-body p-0">
          ${history.length ? `<table class="table"><thead><tr><th>Date</th><th>In</th><th>Out</th><th>Hours</th><th>Status</th></tr></thead><tbody>${historyRows}</tbody></table>` : `<div class="empty-state"><svg viewBox="0 0 24 24" width="48" height="48"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><p>No attendance records yet.</p></div>`}
        </div>
      </div>
    </div>
  `;
}

function renderAttendance() {
  const user = getCurrentUser();
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const month = parseInt(urlParams.get('month')) || new Date().getMonth() + 1;
  const year = parseInt(urlParams.get('year')) || new Date().getFullYear();
  const page = parseInt(urlParams.get('page')) || 1;
  const perPage = 15;

  const attendance = Storage.getAttendance().filter(a => a.user_id === user.id);
  const filtered = attendance.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  const records = filtered.slice(start, start + perPage);

  const rows = records.map(r => `
    <tr>
      <td>${fmtDate(r.date)}</td>
      <td>${fmtTime(r.check_in)}</td>
      <td>${fmtTime(r.check_out)}</td>
      <td>${r.hours_worked ? r.hours_worked.toFixed(2) : '—'}</td>
      <td><span class="badge ${badgeClass(r.status)}">${r.status.charAt(0).toUpperCase() + r.status.slice(1)}</span></td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h2>My Attendance History</h2>
        <p class="subtitle">${filtered.length} record${filtered.length !== 1 ? 's' : ''} found</p>
      </div>
    </div>
    <div class="filter-bar">
      <form id="attendance-filter" class="filter-form">
        <div class="filter-group">
          <select name="month" class="form-input">
            ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => `<option value="${i+1}" ${i+1 === month ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <input type="number" name="year" class="form-input" value="${year}" min="2020" max="2030" style="width:95px" />
        </div>
        <button type="submit" class="btn btn-secondary">Apply</button>
        <a href="#attendance" class="btn btn-ghost">Clear</a>
      </form>
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${records.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
        <div class="pagination">
          ${page > 1 ? `<a href="#attendance?month=${month}&year=${year}&page=${page-1}" class="page-btn">← Prev</a>` : ''}
          <span class="page-info">Page ${page} of ${totalPages}</span>
          ${page < totalPages ? `<a href="#attendance?month=${month}&year=${year}&page=${page+1}" class="page-btn">Next →</a>` : ''}
        </div>` : `<div class="empty-state large"><svg viewBox="0 0 24 24" width="64" height="64"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg><h3>No records found</h3><p>Try adjusting your filter criteria.</p></div>`}
      </div>
    </div>
  `;
}

function renderLeaves() {
  const user = getCurrentUser();
  const leaves = Storage.getLeaves().filter(l => l.user_id === user.id).sort((a, b) => new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date));

  const rows = leaves.map(l => `
    <tr>
      <td><span class="leave-type ${leaveTypeClass(l.leave_type)}">${l.leave_type.charAt(0).toUpperCase() + l.leave_type.slice(1)}</span></td>
      <td>${fmtDate(l.start_date)}</td>
      <td>${fmtDate(l.end_date)}</td>
      <td>${l.days_requested}</td>
      <td class="text-truncate" style="max-width:180px" title="${escapeHtml(l.reason || '')}">${escapeHtml(l.reason || '—')}</td>
      <td><span class="badge ${badgeClass(l.status)}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
      <td>${l.admin_note ? `<span class="text-muted text-sm" title="${escapeHtml(l.admin_note)}">Note: ${escapeHtml(l.admin_note)}</span>` : '—'}</td>
    </tr>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h2>My Leave Requests</h2>
        <p class="subtitle">Track and submit your leave requests</p>
      </div>
      <button class="btn btn-primary" id="open-leave-modal"><svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>New Request</button>
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${leaves.length ? `<table class="table"><thead><tr><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions / Notes</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="empty-state large"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg><h3>No leave requests</h3><p>You have not submitted any leave requests yet.</p></div>`}
      </div>
    </div>
    <div class="modal-overlay" id="leaveModal" style="display:none">
      <div class="modal">
        <div class="modal-header"><h3>Request Leave</h3><button class="modal-close" onclick="document.getElementById('leaveModal').style.display='none'">×</button></div>
        <form id="leave-form">
          <div class="modal-body">
            <div class="form-group">
              <label>Leave Type <span class="req">*</span></label>
              <select name="leave_type" required>
                <option value="vacation">🏖 Vacation</option>
                <option value="sick">🤒 Sick Leave</option>
                <option value="personal">👤 Personal</option>
                <option value="other">📋 Other</option>
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Start Date <span class="req">*</span></label>
                <input type="date" name="start_date" required min="${getLocalDateString(new Date())}" value="${getLocalDateString(new Date())}" />
              </div>
              <div class="form-group">
                <label>End Date <span class="req">*</span></label>
                <input type="date" name="end_date" required min="${getLocalDateString(new Date())}" value="${getLocalDateString(new Date())}" />
              </div>
            </div>
            <div class="form-group">
              <label>Reason</label>
              <textarea name="reason" rows="3" placeholder="Optional reason for request…"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="document.getElementById('leaveModal').style.display='none'" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAdminDashboard() {
  const users = Storage.getUsers();
  const attendance = Storage.getAttendance();
  const leaves = Storage.getLeaves();
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const totalEmployees = users.filter(u => u.role === 'employee' && u.is_active).length;
  const presentToday = attendance.filter(a => a.date === todayStr && ['present', 'late'].includes(a.status)).length;
  const onLeaveToday = leaves.filter(l => l.status === 'approved' && l.start_date <= todayStr && l.end_date >= todayStr).length;
  const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

  const recent = attendance.filter(a => a.date === todayStr).sort((a, b) => (b.check_in || '').localeCompare(a.check_in || '')).slice(0, 10);
  const recentRows = recent.map(a => {
    const emp = users.find(u => u.id === a.user_id);
    return `<tr>
      <td><div class="emp-cell"><div class="avatar-sm">${emp?.first_name?.[0] || '?'}</div><div><div class="fw-600">${emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</div><div class="text-muted text-sm">${emp?.department || ''}</div></div></div></td>
      <td>${fmtTime(a.check_in)}</td>
      <td>${fmtTime(a.check_out)}</td>
      <td><span class="badge ${badgeClass(a.status)}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
    </tr>`;
  }).join('');

  // Bar chart data (last 7 working days)
  const chartLabels = [];
  const chartPresent = [];
  const chartAbsent = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const ds = getLocalDateString(d);
    chartLabels.push(d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }));
    const p = attendance.filter(a => a.date === ds && ['present', 'late'].includes(a.status)).length;
    chartPresent.push(p);
    chartAbsent.push(Math.max(0, totalEmployees - p));
  }
  const maxVal = Math.max(totalEmployees, 1);
  const chartHtml = chartLabels.map((label, i) => {
    const ph = Math.round((chartPresent[i] / maxVal) * 120);
    const ah = Math.round((chartAbsent[i] / maxVal) * 120);
    return `<div class="bar-group"><div class="bar-wrap"><div class="bar bar-green" style="height:${ph}px" title="${chartPresent[i]} present"></div><div class="bar bar-red" style="height:${ah}px" title="${chartAbsent[i]} absent"></div></div><div class="bar-label">${label}</div></div>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Admin Overview</h2>
        <p class="subtitle">${today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      <div class="header-actions">
        <a href="#employee-form" class="btn btn-primary"><svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Employee</a>
      </div>
    </div>
    <div class="stats-grid stats-grid-4">
      <div class="stat-card stat-blue"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div><div class="stat-info"><span class="stat-value">${totalEmployees}</span><span class="stat-label">Total Employees</span></div></div>
      <div class="stat-card stat-green"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg></div><div class="stat-info"><span class="stat-value">${presentToday}</span><span class="stat-label">Present Today</span></div></div>
      <div class="stat-card stat-red"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div class="stat-info"><span class="stat-value">${absentToday}</span><span class="stat-label">Absent Today</span></div></div>
      <div class="stat-card stat-yellow"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg></div><div class="stat-info"><span class="stat-value">${onLeaveToday}</span><span class="stat-label">On Leave</span></div></div>
    </div>
    ${pendingLeaves > 0 ? `<div class="alert" style="margin-top: 20px;"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>You have <strong>${pendingLeaves}</strong> pending leave request${pendingLeaves !== 1 ? 's' : ''}.</span><a href="#admin-leaves" class="alert-link">Review now →</a></div>` : ''}
    <div class="two-col">
      <div class="card">
        <div class="card-header"><h3>Last 7 Working Days</h3></div>
        <div class="card-body">
          ${chartLabels.length ? `<div class="bar-chart">${chartHtml}</div><div class="chart-legend"><span><i class="dot dot-green"></i>Present</span><span><i class="dot dot-red"></i>Absent</span></div>` : `<div class="empty-state">No data yet.</div>`}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3>Today's Check-ins</h3><a href="#admin-attendance" class="link-sm">View all →</a></div>
        <div class="card-body p-0">
          ${recent.length ? `<table class="table"><thead><tr><th>Employee</th><th>In</th><th>Out</th><th>Status</th></tr></thead><tbody>${recentRows}</tbody></table>` : `<div class="empty-state"><svg viewBox="0 0 24 24" width="40" height="40"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><p>No check-ins recorded today.</p></div>`}
        </div>
      </div>
    </div>
    <h3 class="section-title">Quick Access</h3>
    <div class="quick-nav-grid">
      <a href="#employees" class="quick-nav-card"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Manage Employees</span></a>
      <a href="#admin-attendance" class="quick-nav-card"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></svg><span>Attendance Records</span></a>
      <a href="#admin-leaves" class="quick-nav-card"><svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg><span>Leave Requests</span></a>
      <a href="#reports" class="quick-nav-card"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg><span>Generate Reports</span></a>
    </div>
  `;
}

function renderEmployees() {
  const users = Storage.getUsers();
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const search = (urlParams.get('search') || '').toLowerCase();
  const dept = urlParams.get('department') || '';

  let employees = users.filter(u => u.role === 'employee');
  if (search) {
    employees = employees.filter(e => `${e.first_name} ${e.last_name}`.toLowerCase().includes(search) || e.email.toLowerCase().includes(search));
  }
  if (dept) {
    employees = employees.filter(e => e.department === dept);
  }
  employees.sort((a, b) => a.first_name.localeCompare(b.first_name));
  const departments = [...new Set(users.filter(u => u.role === 'employee' && u.department).map(e => e.department))];

  const cards = employees.map(emp => `
    <div class="employee-card ${!emp.is_active ? 'emp-inactive' : ''}">
      <div class="emp-card-header">
        <div class="avatar-lg">${emp.first_name[0]}${emp.last_name[0]}</div>
        <div class="emp-status-dot ${emp.is_active ? 'active' : 'inactive'}" title="${emp.is_active ? 'Active' : 'Inactive'}"></div>
      </div>
      <div class="emp-card-body">
        <h4>${emp.first_name} ${emp.last_name}</h4>
        <p class="emp-position">${emp.position || 'No position set'}</p>
        <span class="dept-badge">${emp.department || 'No Dept.'}</span>
        <div class="emp-meta">
          <span><svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>${emp.email}</span>
          ${emp.hire_date ? `<span><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>${fmtMonthYear(emp.hire_date)}</span>` : ''}
        </div>
      </div>
      <div class="emp-card-footer">
        <a href="#employee-form?id=${emp.id}" class="btn btn-sm btn-secondary">Edit</a>
        <button type="button" class="btn btn-sm ${emp.is_active ? 'btn-warning' : 'btn-success'}" data-action="toggle" data-id="${emp.id}">${emp.is_active ? 'Deactivate' : 'Activate'}</button>
        <button type="button" class="btn btn-sm btn-danger" data-action="delete" data-id="${emp.id}" data-name="${emp.first_name} ${emp.last_name}">Delete</button>
      </div>
    </div>
  `).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Employees Management</h2>
        <p class="subtitle">${employees.length} employee${employees.length !== 1 ? 's' : ''} found</p>
      </div>
      <a href="#employee-form" class="btn btn-primary"><svg viewBox="0 0 24 24" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Employee</a>
    </div>
    <div class="filter-bar">
      <form id="employee-filter" class="filter-form">
        <div class="filter-group">
          <input type="text" name="search" placeholder="Search name or email…" class="form-input" value="${escapeHtml(search)}" />
        </div>
        <div class="filter-group">
          <select name="department" class="form-input"><option value="">All Departments</option>${departments.map(d => `<option value="${d}" ${dept === d ? 'selected' : ''}>${d}</option>`).join('')}</select>
        </div>
        <button type="submit" class="btn btn-secondary">Filter</button>
        <a href="#employees" class="btn btn-ghost">Clear</a>
      </form>
    </div>
    ${employees.length ? `<div class="employee-grid">${cards}</div>` : `<div class="empty-state large card"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg><h3>No employees found</h3><p>Try adjusting your search filters or add a new employee.</p><a href="#employee-form" class="btn btn-primary">Add First Employee</a></div>`}
  `;
}

function renderEmployeeForm() {
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const empId = urlParams.get('id');
  const users = Storage.getUsers();
  const emp = empId ? users.find(u => u.id === parseInt(empId)) : null;
  const isEdit = !!emp;

  return `
    <div class="page-header">
      <div>
        <h2>${isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
        <p class="subtitle">${isEdit ? 'Update employee information' : 'Create a new employee account'}</p>
      </div>
      <a href="#employees" class="btn btn-ghost">← Back</a>
    </div>
    <div class="form-card">
        <form id="employee-form">
          <div class="form-section">
            <h3 class="form-section-title">Personal Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-first">First Name <span class="req">*</span></label>
                <input type="text" id="emp-first" name="first_name" required value="${emp ? escapeHtml(emp.first_name) : ''}" />
              </div>
              <div class="form-group">
                <label for="emp-last">Last Name <span class="req">*</span></label>
                <input type="text" id="emp-last" name="last_name" required value="${emp ? escapeHtml(emp.last_name) : ''}" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-email">Email Address <span class="req">*</span></label>
                <input type="email" id="emp-email" name="email" value="${emp ? escapeHtml(emp.email) : ''}" ${isEdit ? 'readonly' : 'required'} />
                ${isEdit ? '<small class="help-text">Email cannot be changed.</small>' : ''}
              </div>
              <div class="form-group">
                <label for="emp-phone">Phone Number</label>
                <input type="tel" id="emp-phone" name="phone" value="${emp ? escapeHtml(emp.phone || '') : ''}" />
              </div>
            </div>
          </div>
          <div class="form-section">
            <h3 class="form-section-title">Work Information</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-dept">Department</label>
                <select id="emp-dept" name="department">
                  <option value="">Select department</option>
                  ${['Engineering','Marketing','HR','Finance','Operations','Sales','Management'].map(d => `<option value="${d}" ${emp && emp.department === d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="emp-pos">Position</label>
                <input type="text" id="emp-pos" name="position" value="${emp ? escapeHtml(emp.position || '') : ''}" placeholder="e.g. Senior Developer" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-hire">Hire Date</label>
                <input type="date" id="emp-hire" name="hire_date" value="${emp && emp.hire_date ? emp.hire_date : ''}" />
              </div>
            </div>
          </div>
          <div class="form-section">
            <h3 class="form-section-title">${isEdit ? 'Change Password' : 'Set Password'}</h3>
            <div class="form-row">
              <div class="form-group">
                <label for="emp-password">Password ${isEdit ? '' : '<span class="req">*</span>'}</label>
                <div class="input-wrapper">
                  <input type="password" id="emp-password" name="password" placeholder="${isEdit ? 'Leave blank to keep current' : 'Min. 6 characters'}" ${isEdit ? 'minlength="6"' : 'required minlength="6"'} />
                  <button type="button" class="toggle-pw" onclick="togglePw(this)"><svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                </div>
              </div>
            </div>
          </div>
        <div class="form-actions">
          <a href="#employees" class="btn btn-ghost">Cancel</a>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Employee'}</button>
        </div>
      </form>
    </div>
  `;
}

function renderAdminAttendance() {
  const users = Storage.getUsers();
  const attendance = Storage.getAttendance();
  const employees = users.filter(u => u.role === 'employee' && u.is_active).sort((a, b) => a.first_name.localeCompare(b.first_name));
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const empId = urlParams.get('employee') || '';
  const startStr = urlParams.get('start_date') || '';
  const endStr = urlParams.get('end_date') || '';
  const statusFilter = urlParams.get('status') || '';

  let filtered = attendance;
  if (empId) filtered = filtered.filter(a => a.user_id === parseInt(empId));
  if (startStr) filtered = filtered.filter(a => a.date >= startStr);
  if (endStr) filtered = filtered.filter(a => a.date <= endStr);
  if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);

  filtered.sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.check_in || '').localeCompare(a.check_in || ''));

  const rows = filtered.slice(0, 25).map(a => {
    const emp = users.find(u => u.id === a.user_id);
    return `<tr>
      <td><div class="emp-cell"><div class="avatar-sm">${emp?.first_name?.[0] || '?'}</div><div><div class="fw-600">${emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</div><div class="text-muted text-sm">${emp?.department || ''}</div></div></div></td>
      <td>${fmtDate(a.date)}</td>
      <td>${fmtTime(a.check_in)}</td>
      <td>${fmtTime(a.check_out)}</td>
      <td>${a.hours_worked ? a.hours_worked.toFixed(2) : '—'}</td>
      <td><span class="badge ${badgeClass(a.status)}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span></td>
      <td><button class="btn btn-sm btn-ghost" onclick="openEditModal('${a.id}', '${a.check_in || ''}', '${a.check_out || ''}', '${a.status}')">Edit</button></td>
    </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h2>All Attendance Records</h2>
        <p class="subtitle">${filtered.length} record${filtered.length !== 1 ? 's' : ''} found</p>
      </div>
    </div>
    <div class="filter-bar">
      <form id="admin-att-filter" class="filter-form flex-wrap">
        <div class="filter-group">
          <select name="employee" class="form-input"><option value="">All Employees</option>${employees.map(e => `<option value="${e.id}" ${empId == e.id ? 'selected' : ''}>${e.first_name} ${e.last_name}</option>`).join('')}</select>
        </div>
        <div class="filter-group"><input type="date" name="start_date" class="form-input" value="${startStr}" /></div>
        <div class="filter-group"><input type="date" name="end_date" class="form-input" value="${endStr}" /></div>
        <div class="filter-group">
          <select name="status" class="form-input"><option value="">All Statuses</option><option value="present" ${statusFilter === 'present' ? 'selected' : ''}>Present</option><option value="late" ${statusFilter === 'late' ? 'selected' : ''}>Late</option><option value="absent" ${statusFilter === 'absent' ? 'selected' : ''}>Absent</option></select>
        </div>
        <button type="submit" class="btn btn-secondary">Apply</button>
        <a href="#admin-attendance" class="btn btn-ghost">Clear</a>
      </form>
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${filtered.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Employee</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty-state large"><svg viewBox="0 0 24 24" width="64" height="64"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/></svg><h3>No records found</h3><p>Try adjusting your filter criteria.</p></div>`}
      </div>
    </div>
    <div class="modal-overlay" id="editModal" style="display:none">
      <div class="modal">
        <div class="modal-header"><h3>Edit Attendance Record</h3><button class="modal-close" onclick="closeEditModal()">×</button></div>
        <form id="edit-attendance-form">
          <div class="modal-body">
            <div class="form-row">
              <div class="form-group"><label>Check In Time</label><input type="datetime-local" name="check_in" id="edit_checkin" /></div>
              <div class="form-group"><label>Check Out Time</label><input type="datetime-local" name="check_out" id="edit_checkout" /></div>
            </div>
            <div class="form-group">
              <label>Status</label>
              <select name="status" id="edit_status">
                <option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option><option value="leave">Leave</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="closeEditModal()" class="btn btn-ghost">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderAdminLeaves() {
  const users = Storage.getUsers();
  const leaves = Storage.getLeaves();
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const statusFilter = urlParams.get('status') ?? 'pending';

  const filtered = leaves.filter(l => !statusFilter || l.status === statusFilter).sort((a, b) => new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date));

  const rows = filtered.map(l => {
    const emp = users.find(u => u.id === l.user_id);
    return `<tr>
      <td><div class="emp-cell"><div class="avatar-sm">${emp?.first_name?.[0] || '?'}</div><div><div class="fw-600">${emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}</div><div class="text-muted text-sm">${emp?.department || ''}</div></div></div></td>
      <td><span class="leave-type ${leaveTypeClass(l.leave_type)}">${l.leave_type.charAt(0).toUpperCase() + l.leave_type.slice(1)}</span></td>
      <td>${fmtDate(l.start_date)}</td>
      <td>${fmtDate(l.end_date)}</td>
      <td>${l.days_requested}</td>
      <td class="text-truncate" style="max-width:180px" title="${escapeHtml(l.reason || '')}">${escapeHtml(l.reason || '—')}</td>
      <td><span class="badge ${badgeClass(l.status)}">${l.status.charAt(0).toUpperCase() + l.status.slice(1)}</span></td>
      <td>${l.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="openReviewModal('${l.id}', '${emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown'}')">Review</button>` : `<span class="text-muted text-sm">${l.reviewed_at ? fmtShort(l.reviewed_at) : '—'}</span>`}</td>
    </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Leave Management</h2>
        <p class="subtitle">Manage all employee leave requests</p>
      </div>
    </div>
    <div class="tab-bar">
      ${['pending', 'approved', 'rejected', ''].map(s => `<a href="#admin-leaves?status=${s}" class="tab ${statusFilter === s ? 'active' : ''}">${s === '' ? 'All Requests' : s === 'pending' ? '⏳ Pending' : s === 'approved' ? '✅ Approved' : '❌ Rejected'}</a>`).join('')}
    </div>
    <div class="card">
      <div class="card-body p-0">
        ${filtered.length ? `<table class="table"><thead><tr><th>Employee</th><th>Type</th><th>Start</th><th>End</th><th>Days</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="empty-state large"><svg viewBox="0 0 24 24" width="64" height="64"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/></svg><h3>No leave requests</h3><p>No requests match the selected filter.</p></div>`}
      </div>
    </div>
    <div class="modal-overlay" id="reviewModal" style="display:none">
      <div class="modal">
        <div class="modal-header"><h3>Review Leave Request</h3><button class="modal-close" onclick="closeReviewModal()">×</button></div>
        <form id="review-form">
          <div class="modal-body">
            <p id="reviewEmpName" class="review-name" style="font-size:15px; font-weight:700; margin-bottom:12px;"></p>
            <div class="form-group">
              <label>Admin Note (optional)</label>
              <textarea name="admin_note" rows="3" placeholder="Add a note for employee…"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" onclick="closeReviewModal()" class="btn btn-ghost">Cancel</button>
            <button type="submit" name="action" value="reject" class="btn btn-danger">Reject</button>
            <button type="submit" name="action" value="approve" class="btn btn-success">Approve</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function renderReports() {
  const users = Storage.getUsers().filter(u => u.role === 'employee' && u.is_active);
  const attendance = Storage.getAttendance();
  const leaves = Storage.getLeaves();
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const month = parseInt(urlParams.get('month')) || new Date().getMonth() + 1;
  const year = parseInt(urlParams.get('year')) || new Date().getFullYear();

  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const firstDayStr = getLocalDateString(firstDay);
  const lastDayStr = getLocalDateString(lastDay);
  const workingDays = countWorkingDays(firstDayStr, lastDayStr);

  const reportData = users.map(emp => {
    const records = attendance.filter(a => a.user_id === emp.id && new Date(a.date) >= firstDay && new Date(a.date) <= lastDay);
    const present = records.filter(r => ['present', 'late'].includes(r.status)).length;
    const late = records.filter(r => r.status === 'late').length;
    const totalHours = records.reduce((s, r) => s + (r.hours_worked || 0), 0);
    const approvedLeaves = leaves.filter(l => l.user_id === emp.id && l.status === 'approved' && l.start_date <= lastDayStr && l.end_date >= firstDayStr).length;
    const absent = Math.max(0, workingDays - present - approvedLeaves);
    const rate = workingDays > 0 ? ((present / workingDays) * 100) : 0;
    return { employee: emp, present, absent, late, leaves: approvedLeaves, total_hours: +totalHours.toFixed(2), attendance_rate: +rate.toFixed(1) };
  });

  const totalPresent = reportData.reduce((s, r) => s + r.present, 0);
  const totalAbsent = reportData.reduce((s, r) => s + r.absent, 0);
  const totalHoursAll = reportData.reduce((s, r) => s + r.total_hours, 0);
  const avgRate = reportData.length ? (reportData.reduce((s, r) => s + r.attendance_rate, 0) / reportData.length).toFixed(1) : 0;

  const sortedData = [...reportData].sort((a, b) => b.attendance_rate - a.attendance_rate);

  const rows = sortedData.map(r => {
    const fillClass = r.attendance_rate >= 90 ? 'fill-green' : r.attendance_rate >= 75 ? 'fill-yellow' : 'fill-red';
    return `<tr>
      <td><div class="emp-cell"><div class="avatar-sm">${r.employee.first_name[0]}</div><div><div class="fw-600">${r.employee.first_name} ${r.employee.last_name}</div><div class="text-muted text-sm">${r.employee.position || ''}</div></div></div></td>
      <td>${r.employee.department || '—'}</td>
      <td class="text-center">${r.present}</td>
      <td class="text-center"><span class="${r.absent > 3 ? 'text-danger fw-600' : ''}">${r.absent}</span></td>
      <td class="text-center"><span class="${r.late > 2 ? 'text-warning fw-600' : ''}">${r.late}</span></td>
      <td class="text-center">${r.leaves}</td>
      <td>${r.total_hours}h</td>
      <td><div class="progress-cell"><div class="progress-bar-wrap"><div class="progress-fill ${fillClass}" style="width:${Math.min(100, r.attendance_rate)}%"></div></div><span class="progress-label">${r.attendance_rate}%</span></div></td>
    </tr>`;
  }).join('');

  return `
    <div class="page-header">
      <div>
        <h2>Monthly Attendance Report</h2>
        <p class="subtitle">${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — ${workingDays} working days</p>
      </div>
      <button class="btn btn-secondary" onclick="window.print()"><svg viewBox="0 0 24 24" width="16" height="16"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>Print Report</button>
    </div>
    <div class="filter-bar">
      <form id="report-filter" class="filter-form">
        <div class="filter-group">
          <select name="month" class="form-input">
            ${['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => `<option value="${i+1}" ${i+1 === month ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <input type="number" name="year" class="form-input" value="${year}" min="2020" max="2030" style="width:100px" />
        </div>
        <button type="submit" class="btn btn-primary">Generate</button>
      </form>
    </div>
    ${reportData.length ? `<div class="stats-grid stats-grid-4" style="margin-bottom: 24px;">
      <div class="stat-card stat-blue"><div class="stat-icon"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div><div class="stat-info"><span class="stat-value">${reportData.length}</span><span class="stat-label">Employees</span></div></div>
      <div class="stat-card stat-green"><div class="stat-icon"><svg viewBox="0 0 24 24"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg></div><div class="stat-info"><span class="stat-value">${avgRate}%</span><span class="stat-label">Avg. Attendance</span></div></div>
      <div class="stat-card stat-purple"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg></div><div class="stat-info"><span class="stat-value">${Math.round(totalHoursAll)}h</span><span class="stat-label">Total Hours</span></div></div>
      <div class="stat-card stat-red"><div class="stat-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg></div><div class="stat-info"><span class="stat-value">${totalAbsent}</span><span class="stat-label">Total Absences</span></div></div>
    </div>
    <div class="card">
      <div class="card-header"><h3>Employee Breakdown — ${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3></div>
      <div class="card-body p-0">
        <div class="table-responsive"><table class="table"><thead><tr><th>Employee</th><th>Department</th><th class="text-center">Present</th><th class="text-center">Absent</th><th class="text-center">Late</th><th class="text-center">Leaves</th><th>Total Hours</th><th>Attendance %</th></tr></thead><tbody>${rows}</tbody><tfoot><tr class="table-footer"><td colspan="2"><strong>Totals</strong></td><td class="text-center"><strong>${totalPresent}</strong></td><td class="text-center"><strong>${totalAbsent}</strong></td><td class="text-center"></td><td class="text-center"></td><td><strong>${Math.round(totalHoursAll * 10) / 10}h</strong></td><td><strong>${avgRate}%</strong></td></tr></tfoot></table></div>
      </div>
    </div>` : `<div class="empty-state large card"><svg viewBox="0 0 24 24" width="64" height="64"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg><h3>No data available</h3><p>No employees or attendance records found for this period.</p></div>`}
  `;
}

function countWorkingDays(startDateStr, endDateStr) {
  let count = 0;
  const d = new Date(startDateStr + 'T00:00:00');
  while (getLocalDateString(d) <= endDateStr) {
    if (d.getDay() !== 0 && d.getDay() !== 6) count++;
    d.setDate(d.getDate() + 1);
  }
  return count;
}

// ==================== GLOBAL ACTIONS ====================
function togglePw(btn) {
  const input = btn.closest('.input-wrapper').querySelector('input');
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  
  const eyeSvg = `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
  const eyeOffSvg = `<svg viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/></svg>`;
  
  btn.innerHTML = isPw ? eyeOffSvg : eyeSvg;
}

function openEditModal(id, checkIn, checkOut, status) {
  const form = document.getElementById('edit-attendance-form');
  form.dataset.attId = id;
  form.action = '';
  document.getElementById('edit_checkin').value = toLocalDatetimeInput(checkIn);
  document.getElementById('edit_checkout').value = toLocalDatetimeInput(checkOut);
  document.getElementById('edit_status').value = status;
  document.getElementById('editModal').style.display = 'flex';
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

function openReviewModal(id, name) {
  const form = document.getElementById('review-form');
  form.dataset.leaveId = id;
  form.action = '';
  document.getElementById('reviewEmpName').textContent = 'Reviewing request for: ' + name;
  document.getElementById('reviewModal').style.display = 'flex';
}

function closeReviewModal() {
  document.getElementById('reviewModal').style.display = 'none';
}

// ==================== EVENT BINDING ====================
function bindPageEvents(page) {
  if (page === 'login') {
    document.getElementById('login-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;
      const user = login(email, password);
      if (user) {
        showFlash(`Welcome back, ${user.first_name}!`, 'success');
        navigate(user.role === 'admin' ? 'admin' : 'dashboard');
      } else {
        showFlash('Invalid email or password.', 'danger');
      }
    });
  }

  if (page === 'register') {
    document.getElementById('register-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const first = document.getElementById('reg-first').value.trim();
      const last = document.getElementById('reg-last').value.trim();
      const email = document.getElementById('reg-email').value.trim().toLowerCase();
      const password = document.getElementById('reg-password').value;
      const dept = document.getElementById('reg-dept').value;
      const pos = document.getElementById('reg-pos').value.trim();

      if (!first || !last || !email || !password) {
        showFlash('All required fields must be filled.', 'danger');
        return;
      }
      if (password.length < 6) {
        showFlash('Password must be at least 6 characters.', 'danger');
        return;
      }
      const users = Storage.getUsers();
      if (users.some(u => u.email.toLowerCase() === email)) {
        showFlash('Email already registered.', 'danger');
        return;
      }
      const newUser = { id: Date.now(), first_name: first, last_name: last, email, password_hash: hash(password), role: 'employee', department: dept, position: pos, phone: '', hire_date: getLocalDateString(new Date()), is_active: true, created_at: getLocalDateString(new Date()) };
      users.push(newUser);
      Storage.saveUsers(users);
      showFlash('Registration successful! Please log in.', 'success');
      navigate('login');
    });
  }

  if (page === 'dashboard') {
    document.getElementById('checkin-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const user = getCurrentUser();
      const today = getLocalDateString(new Date());
      const attendance = Storage.getAttendance();
      const existing = attendance.find(a => a.user_id === user.id && a.date === today);
      if (existing) { showFlash('You have already checked in today.', 'warning'); return; }
      const now = new Date();
      const checkInTime = now.toTimeString().slice(0, 5);
      const lateThreshold = '09:15';
      const status = checkInTime > lateThreshold ? 'late' : 'present';
      attendance.push({ id: generateId(), user_id: user.id, date: today, check_in: now.toISOString(), check_out: null, hours_worked: null, status, notes: '', created_at: today });
      Storage.saveAttendance(attendance);
      showFlash(`Checked in successfully at ${fmtTime(now.toISOString())}.`, 'success');
      navigate('dashboard');
    });
    document.getElementById('checkout-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const user = getCurrentUser();
      const today = getLocalDateString(new Date());
      const attendance = Storage.getAttendance();
      const rec = attendance.find(a => a.user_id === user.id && a.date === today);
      if (!rec) { showFlash('You have not checked in today.', 'warning'); return; }
      if (rec.check_out) { showFlash('You have already checked out today.', 'warning'); return; }
      const now = new Date();
      rec.check_out = now.toISOString();
      if (rec.check_in) {
        const delta = new Date(now) - new Date(rec.check_in);
        rec.hours_worked = +(delta / 3600000).toFixed(2);
      }
      Storage.saveAttendance(attendance);
      showFlash(`Checked out successfully at ${fmtTime(now.toISOString())}. Hours worked: ${rec.hours_worked}h`, 'success');
      navigate('dashboard');
    });
  }

  if (page === 'attendance') {
    document.getElementById('attendance-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('month')) params.set('month', fd.get('month'));
      if (fd.get('year')) params.set('year', fd.get('year'));
      navigate(`attendance?${params.toString()}`);
    });
  }

  if (page === 'leaves') {
    document.getElementById('open-leave-modal')?.addEventListener('click', () => {
      document.getElementById('leaveModal').style.display = 'flex';
    });
    document.getElementById('leave-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const start = fd.get('start_date');
      const end = fd.get('end_date');
      const startDate = new Date(start + 'T00:00:00');
      const endDate = new Date(end + 'T00:00:00');
      const todayLocal = getLocalDateString(new Date());
      if (start < todayLocal) { showFlash('Start date cannot be in the past.', 'danger'); return; }
      if (endDate < startDate) { showFlash('End date must be after start date.', 'danger'); return; }
      const days = Math.floor((endDate - startDate) / 86400000) + 1;
      const user = getCurrentUser();
      const leaves = Storage.getLeaves();
      leaves.push({ id: generateId(), user_id: user.id, leave_type: fd.get('leave_type'), start_date: start, end_date: end, days_requested: days, reason: fd.get('reason') || '', status: 'pending', admin_note: '', reviewed_at: null, created_at: todayLocal });
      Storage.saveLeaves(leaves);
      const modal = document.getElementById('leaveModal');
      if (modal) modal.style.display = 'none';
      showFlash('Leave request submitted successfully.', 'success');
      navigate('leaves');
    });
  }

  if (page === 'employees') {
    document.getElementById('employee-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('search')) params.set('search', fd.get('search'));
      if (fd.get('department')) params.set('department', fd.get('department'));
      navigate(`employees?${params.toString()}`);
    });
  }

  if (page === 'employee-form') {
    document.getElementById('employee-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const fn = fd.get('first_name')?.trim() || '';
      const ln = fd.get('last_name')?.trim() || '';
      const em = fd.get('email')?.trim().toLowerCase() || '';
      const dp = fd.get('department') || '';
      const ps = fd.get('position')?.trim() || '';
      const ph = fd.get('phone')?.trim() || '';
      const hd = fd.get('hire_date') || '';
      const pw = fd.get('password') || '';

      if (!fn || !ln || !em) { showFlash('Required fields missing.', 'danger'); return; }

      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const editId = urlParams.get('id');
      const users = Storage.getUsers();

      if (editId) {
        const emp = users.find(u => u.id === parseInt(editId));
        if (emp) {
          emp.first_name = fn; emp.last_name = ln; emp.department = dp; emp.position = ps; emp.phone = ph; emp.hire_date = hd || null;
          if (pw && pw.length >= 6) emp.password_hash = hash(pw);
          else if (pw && pw.length < 6) { showFlash('Password must be at least 6 characters.', 'danger'); return; }
          Storage.saveUsers(users);
          showFlash('Employee updated successfully.', 'success');
        }
      } else {
        if (!pw || pw.length < 6) { showFlash('Password must be at least 6 characters.', 'danger'); return; }
        if (users.some(u => u.email.toLowerCase() === em)) { showFlash('Email already exists.', 'danger'); return; }
        users.push({ id: Date.now(), first_name: fn, last_name: ln, email: em, password_hash: hash(pw), role: 'employee', department: dp, position: ps, phone: ph, hire_date: hd || null, is_active: true, created_at: getLocalDateString(new Date()) });
        Storage.saveUsers(users);
        showFlash(`Employee ${fn} ${ln} added successfully.`, 'success');
      }
      navigate('employees');
    });
  }

  if (page === 'admin-leaves') {
    const reviewForm = document.getElementById('review-form');
    const approveBtn = reviewForm?.querySelector('button[value="approve"]');
    const rejectBtn = reviewForm?.querySelector('button[value="reject"]');

    approveBtn?.addEventListener('click', () => {
      reviewForm.dataset.action = 'approve';
    });
    rejectBtn?.addEventListener('click', () => {
      reviewForm.dataset.action = 'reject';
    });

    reviewForm?.addEventListener('submit', e => {
      e.preventDefault();
      const action = e.target.dataset.action || 'reject';
      const leaveId = e.target.dataset.leaveId;
      const leaves = Storage.getLeaves();
      const leave = leaves.find(l => l.id == leaveId);
      if (leave) {
        leave.status = action === 'approve' ? 'approved' : 'rejected';
        leave.admin_note = new FormData(e.target).get('admin_note') || '';
        leave.reviewed_at = new Date().toISOString();
        Storage.saveLeaves(leaves);
        showFlash(action === 'approve' ? 'Leave request approved.' : 'Leave request rejected.', action === 'approve' ? 'success' : 'danger');
      }
      closeReviewModal();
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      navigate(`admin-leaves?status=${newStatus}`);
    });
  }

  if (page === 'admin-attendance') {
    document.getElementById('admin-att-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('employee')) params.set('employee', fd.get('employee'));
      if (fd.get('start_date')) params.set('start_date', fd.get('start_date'));
      if (fd.get('end_date')) params.set('end_date', fd.get('end_date'));
      if (fd.get('status')) params.set('status', fd.get('status'));
      navigate(`admin-attendance?${params.toString()}`);
    });

    document.getElementById('edit-attendance-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const attId = e.target.dataset.attId;
      const attendance = Storage.getAttendance();
      const rec = attendance.find(a => a.id == attId);
      if (rec) {
        const ci = document.getElementById('edit_checkin').value;
        const co = document.getElementById('edit_checkout').value;
        const status = document.getElementById('edit_status').value;
        if (ci) rec.check_in = new Date(ci).toISOString();
        if (co) {
          rec.check_out = new Date(co).toISOString();
          if (rec.check_in) {
            const delta = new Date(rec.check_out) - new Date(rec.check_in);
            rec.hours_worked = +(delta / 3600000).toFixed(2);
          }
        }
        rec.status = status;
        Storage.saveAttendance(attendance);
        showFlash('Attendance record updated.', 'success');
      }
      closeEditModal();
      navigate('admin-attendance');
    });
  }

  if (page === 'reports') {
    document.getElementById('report-filter')?.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const params = new URLSearchParams();
      if (fd.get('month')) params.set('month', fd.get('month'));
      if (fd.get('year')) params.set('year', fd.get('year'));
      navigate(`reports?${params.toString()}`);
    });
  }

  // Employee action buttons (toggle/delete)
  document.querySelectorAll('button[data-action="toggle"]').forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const users = Storage.getUsers();
      const emp = users.find(u => u.id === id);
      if (emp) {
        emp.is_active = !emp.is_active;
        Storage.saveUsers(users);
        showFlash(`Employee ${emp.first_name} ${emp.last_name} ${emp.is_active ? 'activated' : 'deactivated'}.`, 'success');
        handleRoute();
      }
    };
  });
  document.querySelectorAll('button[data-action="delete"]').forEach(btn => {
    btn.onclick = e => {
      e.preventDefault();
      const id = parseInt(btn.dataset.id);
      const name = btn.dataset.name || 'employee';
      if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
      let users = Storage.getUsers();
      const emp = users.find(u => u.id === id);
      if (emp && emp.id === getCurrentUser()?.id) { showFlash('Cannot delete your own account.', 'danger'); return; }
      let attendance = Storage.getAttendance();
      let leaves = Storage.getLeaves();
      attendance = attendance.filter(a => a.user_id !== id);
      leaves = leaves.filter(l => l.user_id !== id);
      users = users.filter(u => u.id !== id);
      Storage.saveAttendance(attendance);
      Storage.saveLeaves(leaves);
      Storage.saveUsers(users);
      showFlash('Employee deleted.', 'success');
      handleRoute();
    };
  });
}

// ==================== INIT ====================
function init() {
  seedData();
  window.addEventListener('hashchange', handleRoute);
  document.addEventListener('DOMContentLoaded', () => {
    handleRoute();
    updateDateBadge();
    document.getElementById('hamburger')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('overlay').classList.toggle('active');
    });
    document.getElementById('overlay')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('overlay').classList.remove('active');
    });
    document.getElementById('logout-btn')?.addEventListener('click', e => {
      e.preventDefault();
      logout();
      showFlash('You have been logged out.', 'info');
      navigate('login');
    });
  });
}

init();
