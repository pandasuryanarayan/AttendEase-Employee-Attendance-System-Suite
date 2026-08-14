# app.py
from flask import Flask, render_template, redirect, url_for, request, session, flash, jsonify
from models import db, User, Attendance, LeaveRequest
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date, timedelta
from functools import wraps
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///attendance.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# ─── Decorators ───────────────────────────────────────────────────────────────

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to continue.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please log in to continue.', 'warning')
            return redirect(url_for('login'))
        if session.get('role') != 'admin':
            flash('Admin access required.', 'danger')
            return redirect(url_for('employee_dashboard'))
        return f(*args, **kwargs)
    return decorated


# ─── Context Processor ────────────────────────────────────────────────────────

@app.context_processor
def inject_now():
    return {'now': datetime.utcnow(), 'current_date': date.today()}


# ─── Auth Routes ──────────────────────────────────────────────────────────────

@app.route('/')
def index():
    if 'user_id' in session:
        if session.get('role') == 'admin':
            return redirect(url_for('admin_dashboard'))
        return redirect(url_for('employee_dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        user = User.query.filter_by(email=email, is_active=True).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['role'] = user.role
            session['name'] = user.full_name
            flash(f'Welcome back, {user.first_name}!', 'success')
            return redirect(url_for('admin_dashboard') if user.role == 'admin' else url_for('employee_dashboard'))
        flash('Invalid email or password.', 'danger')
    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        department = request.form.get('department', '').strip()
        position = request.form.get('position', '').strip()

        if not all([first_name, last_name, email, password]):
            flash('All required fields must be filled.', 'danger')
            return render_template('register.html')

        if len(password) < 6:
            flash('Password must be at least 6 characters.', 'danger')
            return render_template('register.html')

        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'danger')
            return render_template('register.html')

        user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            password_hash=generate_password_hash(password),
            department=department,
            position=position,
            role='employee'
        )
        db.session.add(user)
        db.session.commit()
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')


@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


# ─── Employee Routes ──────────────────────────────────────────────────────────

@app.route('/dashboard')
@login_required
def employee_dashboard():
    if session.get('role') == 'admin':
        return redirect(url_for('admin_dashboard'))

    user = User.query.get_or_404(session['user_id'])
    today = date.today()

    today_attendance = Attendance.query.filter_by(
        user_id=user.id, date=today
    ).first()

    # Monthly summary
    first_day = today.replace(day=1)
    month_records = Attendance.query.filter(
        Attendance.user_id == user.id,
        Attendance.date >= first_day,
        Attendance.date <= today
    ).all()

    working_days = sum(1 for i in range((today - first_day).days + 1)
                       if (first_day + timedelta(days=i)).weekday() < 5)
    present_days = sum(1 for r in month_records if r.status in ('present', 'late'))
    late_days = sum(1 for r in month_records if r.status == 'late')
    total_hours = sum(r.hours_worked or 0 for r in month_records)
    absent_days = max(0, working_days - present_days)

    # Recent history (last 10)
    history = Attendance.query.filter_by(user_id=user.id)\
        .order_by(Attendance.date.desc()).limit(10).all()

    # Pending leave requests
    pending_leaves = LeaveRequest.query.filter_by(
        user_id=user.id, status='pending'
    ).count()

    return render_template('employee_dashboard.html',
                           user=user,
                           today=today,
                           today_attendance=today_attendance,
                           working_days=working_days,
                           present_days=present_days,
                           late_days=late_days,
                           total_hours=round(total_hours, 2),
                           absent_days=absent_days,
                           history=history,
                           pending_leaves=pending_leaves)


@app.route('/checkin', methods=['POST'])
@login_required
def checkin():
    today = date.today()
    existing = Attendance.query.filter_by(
        user_id=session['user_id'], date=today
    ).first()

    if existing:
        flash('You have already checked in today.', 'warning')
        return redirect(url_for('employee_dashboard'))

    now = datetime.now()
    check_in_time = now.time()
    # Late if after 9:15 AM
    late_threshold = datetime.strptime('09:15', '%H:%M').time()
    status = 'late' if check_in_time > late_threshold else 'present'

    record = Attendance(
        user_id=session['user_id'],
        date=today,
        check_in=now,
        status=status
    )
    db.session.add(record)
    db.session.commit()
    flash(f'Checked in successfully at {now.strftime("%I:%M %p")}.', 'success')
    return redirect(url_for('employee_dashboard'))


@app.route('/checkout', methods=['POST'])
@login_required
def checkout():
    today = date.today()
    record = Attendance.query.filter_by(
        user_id=session['user_id'], date=today
    ).first()

    if not record:
        flash('You have not checked in today.', 'warning')
        return redirect(url_for('employee_dashboard'))

    if record.check_out:
        flash('You have already checked out today.', 'warning')
        return redirect(url_for('employee_dashboard'))

    now = datetime.now()
    record.check_out = now
    if record.check_in:
        delta = now - record.check_in
        record.hours_worked = round(delta.total_seconds() / 3600, 2)
    db.session.commit()
    flash(f'Checked out successfully at {now.strftime("%I:%M %p")}. '
          f'Hours worked: {record.hours_worked:.2f}h', 'success')
    return redirect(url_for('employee_dashboard'))


@app.route('/attendance/history')
@login_required
def attendance_history():
    user = User.query.get_or_404(session['user_id'])
    page = request.args.get('page', 1, type=int)
    month = request.args.get('month', date.today().month, type=int)
    year = request.args.get('year', date.today().year, type=int)

    query = Attendance.query.filter_by(user_id=user.id)
    try:
        start = date(year, month, 1)
        if month == 12:
            end = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            end = date(year, month + 1, 1) - timedelta(days=1)
        query = query.filter(Attendance.date >= start, Attendance.date <= end)
    except ValueError:
        pass

    records = query.order_by(Attendance.date.desc()).paginate(
        page=page, per_page=20, error_out=False
    )
    return render_template('attendance.html', records=records,
                           user=user, month=month, year=year,
                           is_admin=False)


@app.route('/leave/request', methods=['GET', 'POST'])
@login_required
def leave_request():
    user = User.query.get_or_404(session['user_id'])
    if request.method == 'POST':
        leave_type = request.form.get('leave_type', '')
        start_date_str = request.form.get('start_date', '')
        end_date_str = request.form.get('end_date', '')
        reason = request.form.get('reason', '').strip()

        try:
            start_dt = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_dt = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            flash('Invalid date format.', 'danger')
            return redirect(url_for('leave_request'))

        if start_dt < date.today():
            flash('Start date cannot be in the past.', 'danger')
            return redirect(url_for('leave_request'))

        if end_dt < start_dt:
            flash('End date must be after start date.', 'danger')
            return redirect(url_for('leave_request'))

        days = (end_dt - start_dt).days + 1
        leave = LeaveRequest(
            user_id=user.id,
            leave_type=leave_type,
            start_date=start_dt,
            end_date=end_dt,
            days_requested=days,
            reason=reason,
            status='pending'
        )
        db.session.add(leave)
        db.session.commit()
        flash('Leave request submitted successfully.', 'success')
        return redirect(url_for('employee_dashboard'))

    leaves = LeaveRequest.query.filter_by(user_id=user.id)\
        .order_by(LeaveRequest.created_at.desc()).all()
    return render_template('leaves.html', user=user, leaves=leaves, is_admin=False)


# ─── Admin Routes ─────────────────────────────────────────────────────────────

@app.route('/admin')
@admin_required
def admin_dashboard():
    today = date.today()
    total_employees = User.query.filter_by(role='employee', is_active=True).count()
    present_today = Attendance.query.filter_by(date=today).filter(
        Attendance.status.in_(['present', 'late'])
    ).count()
    on_leave_today = LeaveRequest.query.filter(
        LeaveRequest.status == 'approved',
        LeaveRequest.start_date <= today,
        LeaveRequest.end_date >= today
    ).count()
    absent_today = max(0, total_employees - present_today - on_leave_today)
    pending_leaves = LeaveRequest.query.filter_by(status='pending').count()

    # Recent attendance
    recent = db.session.query(Attendance, User)\
        .join(User, Attendance.user_id == User.id)\
        .filter(Attendance.date == today)\
        .order_by(Attendance.check_in.desc()).all()

    # Monthly chart data (last 7 days)
    chart_labels = []
    chart_present = []
    chart_absent = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        if d.weekday() < 5:
            chart_labels.append(d.strftime('%a %d'))
            p = Attendance.query.filter_by(date=d).filter(
                Attendance.status.in_(['present', 'late'])
            ).count()
            chart_present.append(p)
            chart_absent.append(max(0, total_employees - p))

    return render_template('admin_dashboard.html',
                           total_employees=total_employees,
                           present_today=present_today,
                           absent_today=absent_today,
                           on_leave_today=on_leave_today,
                           pending_leaves=pending_leaves,
                           recent=recent,
                           today=today,
                           chart_labels=chart_labels,
                           chart_present=chart_present,
                           chart_absent=chart_absent)


@app.route('/admin/employees')
@admin_required
def admin_employees():
    search = request.args.get('search', '').strip()
    dept = request.args.get('department', '')
    query = User.query.filter_by(role='employee')
    if search:
        query = query.filter(
            (User.first_name.ilike(f'%{search}%')) |
            (User.last_name.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))
        )
    if dept:
        query = query.filter_by(department=dept)
    employees = query.order_by(User.first_name).all()
    departments = db.session.query(User.department).filter(
        User.role == 'employee', User.department != None
    ).distinct().all()
    departments = [d[0] for d in departments if d[0]]
    return render_template('employees.html', employees=employees,
                           departments=departments, search=search, dept=dept)


@app.route('/admin/employees/add', methods=['GET', 'POST'])
@admin_required
def add_employee():
    if request.method == 'POST':
        first_name = request.form.get('first_name', '').strip()
        last_name = request.form.get('last_name', '').strip()
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        department = request.form.get('department', '').strip()
        position = request.form.get('position', '').strip()
        phone = request.form.get('phone', '').strip()
        hire_date_str = request.form.get('hire_date', '')

        if not all([first_name, last_name, email, password]):
            flash('Required fields missing.', 'danger')
            return render_template('employee_form.html', employee=None)

        if User.query.filter_by(email=email).first():
            flash('Email already exists.', 'danger')
            return render_template('employee_form.html', employee=None)

        hire_date = None
        if hire_date_str:
            try:
                hire_date = datetime.strptime(hire_date_str, '%Y-%m-%d').date()
            except ValueError:
                pass

        user = User(
            first_name=first_name, last_name=last_name,
            email=email, password_hash=generate_password_hash(password),
            department=department, position=position,
            phone=phone, hire_date=hire_date, role='employee'
        )
        db.session.add(user)
        db.session.commit()
        flash(f'Employee {user.full_name} added successfully.', 'success')
        return redirect(url_for('admin_employees'))
    return render_template('employee_form.html', employee=None)


@app.route('/admin/employees/<int:emp_id>/edit', methods=['GET', 'POST'])
@admin_required
def edit_employee(emp_id):
    employee = User.query.get_or_404(emp_id)
    if request.method == 'POST':
        employee.first_name = request.form.get('first_name', '').strip()
        employee.last_name = request.form.get('last_name', '').strip()
        employee.department = request.form.get('department', '').strip()
        employee.position = request.form.get('position', '').strip()
        employee.phone = request.form.get('phone', '').strip()
        hire_date_str = request.form.get('hire_date', '')
        if hire_date_str:
            try:
                employee.hire_date = datetime.strptime(hire_date_str, '%Y-%m-%d').date()
            except ValueError:
                pass
        new_password = request.form.get('password', '')
        if new_password:
            if len(new_password) < 6:
                flash('Password must be at least 6 characters.', 'danger')
                return render_template('employee_form.html', employee=employee)
            employee.password_hash = generate_password_hash(new_password)
        db.session.commit()
        flash('Employee updated successfully.', 'success')
        return redirect(url_for('admin_employees'))
    return render_template('employee_form.html', employee=employee)


@app.route('/admin/employees/<int:emp_id>/toggle', methods=['POST'])
@admin_required
def toggle_employee(emp_id):
    employee = User.query.get_or_404(emp_id)
    employee.is_active = not employee.is_active
    db.session.commit()
    status = 'activated' if employee.is_active else 'deactivated'
    flash(f'Employee {employee.full_name} {status}.', 'success')
    return redirect(url_for('admin_employees'))


@app.route('/admin/employees/<int:emp_id>/delete', methods=['POST'])
@admin_required
def delete_employee(emp_id):
    employee = User.query.get_or_404(emp_id)
    if employee.id == session['user_id']:
        flash('Cannot delete your own account.', 'danger')
        return redirect(url_for('admin_employees'))
    Attendance.query.filter_by(user_id=emp_id).delete()
    LeaveRequest.query.filter_by(user_id=emp_id).delete()
    db.session.delete(employee)
    db.session.commit()
    flash('Employee deleted.', 'success')
    return redirect(url_for('admin_employees'))


@app.route('/admin/attendance')
@admin_required
def admin_attendance():
    page = request.args.get('page', 1, type=int)
    emp_id = request.args.get('employee', '', type=str)
    start_str = request.args.get('start_date', '')
    end_str = request.args.get('end_date', '')
    status_filter = request.args.get('status', '')

    query = db.session.query(Attendance, User)\
        .join(User, Attendance.user_id == User.id)\
        .filter(User.role == 'employee')

    if emp_id:
        query = query.filter(Attendance.user_id == int(emp_id))
    if start_str:
        try:
            start_dt = datetime.strptime(start_str, '%Y-%m-%d').date()
            query = query.filter(Attendance.date >= start_dt)
        except ValueError:
            pass
    if end_str:
        try:
            end_dt = datetime.strptime(end_str, '%Y-%m-%d').date()
            query = query.filter(Attendance.date <= end_dt)
        except ValueError:
            pass
    if status_filter:
        query = query.filter(Attendance.status == status_filter)

    records = query.order_by(Attendance.date.desc(), Attendance.check_in.desc())\
        .paginate(page=page, per_page=25, error_out=False)

    employees = User.query.filter_by(role='employee', is_active=True)\
        .order_by(User.first_name).all()

    return render_template('attendance.html', records=records,
                           employees=employees, is_admin=True,
                           emp_id=emp_id, start_str=start_str,
                           end_str=end_str, status_filter=status_filter)


@app.route('/admin/attendance/<int:att_id>/edit', methods=['POST'])
@admin_required
def edit_attendance(att_id):
    record = Attendance.query.get_or_404(att_id)
    check_in_str = request.form.get('check_in', '')
    check_out_str = request.form.get('check_out', '')
    status = request.form.get('status', record.status)

    try:
        if check_in_str:
            record.check_in = datetime.strptime(check_in_str, '%Y-%m-%dT%H:%M')
        if check_out_str:
            record.check_out = datetime.strptime(check_out_str, '%Y-%m-%dT%H:%M')
            if record.check_in and record.check_out > record.check_in:
                delta = record.check_out - record.check_in
                record.hours_worked = round(delta.total_seconds() / 3600, 2)
        record.status = status
        db.session.commit()
        flash('Attendance record updated.', 'success')
    except ValueError:
        flash('Invalid date/time format.', 'danger')
    return redirect(url_for('admin_attendance'))


@app.route('/admin/leaves')
@admin_required
def admin_leaves():
    status_filter = request.args.get('status', 'pending')
    query = db.session.query(LeaveRequest, User)\
        .join(User, LeaveRequest.user_id == User.id)
    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)
    leaves = query.order_by(LeaveRequest.created_at.desc()).all()
    return render_template('leaves.html', leaves=leaves, is_admin=True,
                           status_filter=status_filter)


@app.route('/admin/leaves/<int:leave_id>/action', methods=['POST'])
@admin_required
def leave_action(leave_id):
    leave = LeaveRequest.query.get_or_404(leave_id)
    action = request.form.get('action')
    admin_note = request.form.get('admin_note', '').strip()

    if action == 'approve':
        leave.status = 'approved'
        leave.admin_note = admin_note
        leave.reviewed_at = datetime.utcnow()
        flash('Leave request approved.', 'success')
    elif action == 'reject':
        leave.status = 'rejected'
        leave.admin_note = admin_note
        leave.reviewed_at = datetime.utcnow()
        flash('Leave request rejected.', 'info')
    db.session.commit()
    return redirect(url_for('admin_leaves'))


@app.route('/admin/reports')
@admin_required
def admin_reports():
    month = request.args.get('month', date.today().month, type=int)
    year = request.args.get('year', date.today().year, type=int)

    try:
        first_day = date(year, month, 1)
        if month == 12:
            last_day = date(year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day = date(year, month + 1, 1) - timedelta(days=1)
    except ValueError:
        first_day = date.today().replace(day=1)
        last_day = date.today()

    employees = User.query.filter_by(role='employee', is_active=True)\
        .order_by(User.first_name).all()

    report_data = []
    working_days = sum(1 for i in range((last_day - first_day).days + 1)
                       if (first_day + timedelta(days=i)).weekday() < 5)

    for emp in employees:
        records = Attendance.query.filter(
            Attendance.user_id == emp.id,
            Attendance.date >= first_day,
            Attendance.date <= last_day
        ).all()
        present = sum(1 for r in records if r.status in ('present', 'late'))
        late = sum(1 for r in records if r.status == 'late')
        total_hours = sum(r.hours_worked or 0 for r in records)
        approved_leaves = LeaveRequest.query.filter(
            LeaveRequest.user_id == emp.id,
            LeaveRequest.status == 'approved',
            LeaveRequest.start_date <= last_day,
            LeaveRequest.end_date >= first_day
        ).count()
        report_data.append({
            'employee': emp,
            'present': present,
            'absent': max(0, working_days - present - approved_leaves),
            'late': late,
            'leaves': approved_leaves,
            'total_hours': round(total_hours, 2),
            'attendance_rate': round((present / working_days * 100) if working_days > 0 else 0, 1)
        })

    return render_template('reports.html',
                           report_data=report_data,
                           working_days=working_days,
                           month=month, year=year,
                           first_day=first_day, last_day=last_day)


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.route('/api/attendance/today')
@admin_required
def api_today_attendance():
    today = date.today()
    records = db.session.query(Attendance, User)\
        .join(User, Attendance.user_id == User.id)\
        .filter(Attendance.date == today).all()
    data = [{
        'name': u.full_name,
        'check_in': a.check_in.strftime('%I:%M %p') if a.check_in else None,
        'check_out': a.check_out.strftime('%I:%M %p') if a.check_out else None,
        'status': a.status,
        'hours': a.hours_worked
    } for a, u in records]
    return jsonify(data)


# ─── Seed Data ────────────────────────────────────────────────────────────────

def seed_data():
    if User.query.filter_by(email='admin@company.com').first():
        return

    admin = User(
        first_name='Admin', last_name='User',
        email='admin@company.com',
        password_hash=generate_password_hash('admin123'),
        role='admin', department='Management', position='System Administrator'
    )
    db.session.add(admin)

    employees_data = [
        ('Alice', 'Johnson', 'alice@company.com', 'Engineering', 'Senior Developer'),
        ('Bob', 'Smith', 'bob@company.com', 'Engineering', 'Junior Developer'),
        ('Carol', 'Williams', 'carol@company.com', 'Marketing', 'Marketing Manager'),
        ('David', 'Brown', 'david@company.com', 'HR', 'HR Specialist'),
        ('Eve', 'Davis', 'eve@company.com', 'Finance', 'Financial Analyst'),
    ]

    users = []
    for fn, ln, email, dept, pos in employees_data:
        u = User(
            first_name=fn, last_name=ln, email=email,
            password_hash=generate_password_hash('employee123'),
            role='employee', department=dept, position=pos,
            hire_date=date(2023, 1, 15)
        )
        db.session.add(u)
        users.append(u)

    db.session.flush()

    # Seed attendance for last 30 days
    import random
    random.seed(42)
    today = date.today()
    for emp in users:
        for i in range(30, 0, -1):
            d = today - timedelta(days=i)
            if d.weekday() >= 5:
                continue
            if random.random() < 0.1:
                continue
            hour = random.randint(8, 10)
            minute = random.randint(0, 59)
            check_in_dt = datetime(d.year, d.month, d.day, hour, minute)
            hours = random.uniform(7, 9)
            check_out_dt = check_in_dt + timedelta(hours=hours)
            late_threshold = datetime(d.year, d.month, d.day, 9, 15)
            status = 'late' if check_in_dt > late_threshold else 'present'
            att = Attendance(
                user_id=emp.id, date=d,
                check_in=check_in_dt, check_out=check_out_dt,
                hours_worked=round(hours, 2), status=status
            )
            db.session.add(att)

    # Seed leave requests
    leave_data = [
        (users[0], 'vacation', today + timedelta(days=5), today + timedelta(days=7), 'approved'),
        (users[1], 'sick', today - timedelta(days=3), today - timedelta(days=2), 'approved'),
        (users[2], 'personal', today + timedelta(days=10), today + timedelta(days=10), 'pending'),
        (users[3], 'vacation', today + timedelta(days=15), today + timedelta(days=20), 'pending'),
        (users[4], 'sick', today - timedelta(days=1), today - timedelta(days=1), 'rejected'),
    ]
    for emp, ltype, start, end, status in leave_data:
        days = (end - start).days + 1
        lr = LeaveRequest(
            user_id=emp.id, leave_type=ltype,
            start_date=start, end_date=end,
            days_requested=days, reason='Sample leave request',
            status=status
        )
        db.session.add(lr)

    db.session.commit()
    print('✅ Seed data created.')


# ─── App Entry ────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        seed_data()
    app.run(debug=True)
