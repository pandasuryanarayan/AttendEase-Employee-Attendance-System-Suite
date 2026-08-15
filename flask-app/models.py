# models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='employee', nullable=False)  # 'employee' | 'admin'
    department = db.Column(db.String(100))
    position = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    hire_date = db.Column(db.Date)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)

    attendance_records = db.relationship('Attendance', backref='employee', lazy='dynamic',
                                         cascade='all, delete-orphan')
    leave_requests = db.relationship('LeaveRequest', backref='employee', lazy='dynamic',
                                     cascade='all, delete-orphan')

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'

    def __repr__(self):
        return f'<User {self.email}>'


class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)
    hours_worked = db.Column(db.Float)
    status = db.Column(db.String(20), default='present')  # present | late | absent | leave
    notes = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'date', name='uq_user_date'),
    )

    @property
    def check_in_str(self):
        return self.check_in.strftime('%I:%M %p') if self.check_in else '—'

    @property
    def check_out_str(self):
        return self.check_out.strftime('%I:%M %p') if self.check_out else '—'

    @property
    def status_badge(self):
        badges = {
            'present': 'badge-success',
            'late': 'badge-warning',
            'absent': 'badge-danger',
            'leave': 'badge-info'
        }
        return badges.get(self.status, 'badge-secondary')

    def __repr__(self):
        return f'<Attendance user={self.user_id} date={self.date}>'


class LeaveRequest(db.Model):
    __tablename__ = 'leave_requests'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    leave_type = db.Column(db.String(50), nullable=False)  # vacation | sick | personal | other
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    days_requested = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')  # pending | approved | rejected
    admin_note = db.Column(db.Text)
    reviewed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.now)

    @property
    def status_badge(self):
        badges = {
            'pending': 'badge-warning',
            'approved': 'badge-success',
            'rejected': 'badge-danger'
        }
        return badges.get(self.status, 'badge-secondary')

    def __repr__(self):
        return f'<LeaveRequest user={self.user_id} {self.start_date}–{self.end_date}>'
