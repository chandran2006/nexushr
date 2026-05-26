-- NexusHR Database Schema V1
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url TEXT,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    employee_id VARCHAR(20) UNIQUE,
    last_login_at TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    refresh_token TEXT,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_id ON users(employee_id);

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(500),
    head_id UUID,
    parent_department_id UUID REFERENCES departments(id),
    budget DECIMAL(15,2),
    location VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_dept_code ON departments(code);

-- Employees
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    employee_id VARCHAR(20) NOT NULL UNIQUE,
    department_id UUID REFERENCES departments(id),
    job_title VARCHAR(100) NOT NULL,
    job_level VARCHAR(50),
    manager_id UUID REFERENCES employees(id),
    hire_date DATE NOT NULL,
    termination_date DATE,
    date_of_birth DATE,
    gender VARCHAR(20),
    nationality VARCHAR(20),
    national_id VARCHAR(50),
    address VARCHAR(500),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    base_salary DECIMAL(15,2),
    currency VARCHAR(5) DEFAULT 'USD',
    employment_type VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    skills TEXT,
    bio TEXT,
    linkedin_url VARCHAR(200),
    annual_leave_balance INT DEFAULT 20,
    sick_leave_balance INT DEFAULT 10,
    attrition_risk_score DECIMAL(5,2),
    engagement_score DECIMAL(5,2),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_emp_employee_id ON employees(employee_id);
CREATE INDEX idx_emp_department ON employees(department_id);
CREATE INDEX idx_emp_status ON employees(status);

-- Add FK for department head
ALTER TABLE departments ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_id) REFERENCES employees(id);

-- Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    clock_in TIME,
    clock_out TIME,
    work_hours DOUBLE PRECISION,
    overtime_hours DOUBLE PRECISION,
    status VARCHAR(20) NOT NULL DEFAULT 'PRESENT',
    notes VARCHAR(500),
    ip_address VARCHAR(50),
    location VARCHAR(200),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    UNIQUE(employee_id, date)
);

CREATE INDEX idx_att_employee_date ON attendance(employee_id, date);
CREATE INDEX idx_att_date ON attendance(date);

-- Leave Requests
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    leave_type VARCHAR(30) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason VARCHAR(1000),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    approval_notes VARCHAR(500),
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_leave_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);

-- Payroll
CREATE TABLE payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(15,2) NOT NULL,
    housing_allowance DECIMAL(15,2) DEFAULT 0,
    transport_allowance DECIMAL(15,2) DEFAULT 0,
    medical_allowance DECIMAL(15,2) DEFAULT 0,
    performance_bonus DECIMAL(15,2) DEFAULT 0,
    overtime_pay DECIMAL(15,2) DEFAULT 0,
    gross_salary DECIMAL(15,2) NOT NULL,
    tax_deduction DECIMAL(15,2) DEFAULT 0,
    insurance_deduction DECIMAL(15,2) DEFAULT 0,
    other_deductions DECIMAL(15,2) DEFAULT 0,
    net_salary DECIMAL(15,2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    payment_date DATE,
    payslip_url TEXT,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_payroll_employee ON payroll(employee_id);
CREATE INDEX idx_payroll_period ON payroll(pay_period_start, pay_period_end);
CREATE INDEX idx_payroll_status ON payroll(status);

-- Performance Reviews
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    reviewer_id UUID REFERENCES employees(id),
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    overall_rating DECIMAL(3,1),
    performance_score DECIMAL(5,2),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_achieved TEXT,
    comments TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    review_type VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_review_employee ON performance_reviews(employee_id);
CREATE INDEX idx_review_period ON performance_reviews(review_period_start, review_period_end);

-- Goals
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_date DATE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'NOT_STARTED',
    priority VARCHAR(20),
    category VARCHAR(50),
    key_results TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_goal_employee ON goals(employee_id);
CREATE INDEX idx_goal_status ON goals(status);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(500),
    reference_id UUID,
    reference_type VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(is_read);
CREATE INDEX idx_notif_type ON notifications(type);

-- Job Postings
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    department_id UUID REFERENCES departments(id),
    description TEXT,
    requirements TEXT,
    location VARCHAR(100),
    employment_type VARCHAR(20),
    salary_min DECIMAL(15,2),
    salary_max DECIMAL(15,2),
    closing_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    openings INT DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_job_status ON job_postings(status);
CREATE INDEX idx_job_department ON job_postings(department_id);

-- Candidates
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_posting_id UUID NOT NULL REFERENCES job_postings(id),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    resume_url TEXT,
    cover_letter TEXT,
    linkedin_url VARCHAR(200),
    years_of_experience INT,
    current_company VARCHAR(100),
    current_title VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    interview_date DATE,
    notes TEXT,
    rating INT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_candidate_email ON candidates(email);
CREATE INDEX idx_candidate_status ON candidates(status);
CREATE INDEX idx_candidate_job ON candidates(job_posting_id);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    description VARCHAR(500),
    performed_by VARCHAR(100),
    ip_address VARCHAR(50),
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Seed: Default departments
INSERT INTO departments (id, name, code, description, status) VALUES
    (uuid_generate_v4(), 'Engineering', 'ENG', 'Software Engineering Department', 'ACTIVE'),
    (uuid_generate_v4(), 'Human Resources', 'HR', 'Human Resources Department', 'ACTIVE'),
    (uuid_generate_v4(), 'Finance', 'FIN', 'Finance & Accounting Department', 'ACTIVE'),
    (uuid_generate_v4(), 'Marketing', 'MKT', 'Marketing & Communications', 'ACTIVE'),
    (uuid_generate_v4(), 'Operations', 'OPS', 'Operations & Administration', 'ACTIVE'),
    (uuid_generate_v4(), 'Product', 'PRD', 'Product Management', 'ACTIVE');

-- Seed: Super Admin user (password: Admin@123)
INSERT INTO users (id, email, password, first_name, last_name, role, status, employee_id, email_verified) VALUES
    (uuid_generate_v4(), 'admin@nexushr.com',
     '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2.',
     'Super', 'Admin', 'SUPER_ADMIN', 'ACTIVE', 'EMP000001', TRUE);
