-- V2: Seed all demo users with password Demo@1234
-- BCrypt hash for Demo@1234 (strength 12)

-- Update admin password to Demo@1234
UPDATE users SET password = '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.',
                first_name = 'Super', last_name = 'Admin'
WHERE email = 'admin@nexushr.com';

-- Insert remaining demo users (skip if already exists)
INSERT INTO users (id, email, password, first_name, last_name, role, status, employee_id, email_verified)
SELECT uuid_generate_v4(), v.email, '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', v.first_name, v.last_name, v.role, 'ACTIVE', v.emp_id, TRUE
FROM (VALUES
    ('hradmin@nexushr.com',    'HR',        'Admin',     'HR_ADMIN',    'EMP000002'),
    ('hrmanager@nexushr.com',  'HR',        'Manager',   'HR_MANAGER',  'EMP000003'),
    ('manager@nexushr.com',    'Team',      'Manager',   'MANAGER',     'EMP000004'),
    ('employee@nexushr.com',   'John',      'Employee',  'EMPLOYEE',    'EMP000005'),
    ('finance@nexushr.com',    'Finance',   'Officer',   'FINANCE',     'EMP000006'),
    ('executive@nexushr.com',  'Executive', 'Director',  'EXECUTIVE',   'EMP000007'),
    ('recruiter@nexushr.com',  'Talent',    'Recruiter', 'RECRUITER',   'EMP000008')
) AS v(email, first_name, last_name, role, emp_id)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE users.email = v.email);
