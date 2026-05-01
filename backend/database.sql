-- 1. Independent Tables (No Foreign Keys)
CREATE TABLE subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    type VARCHAR(20) DEFAULT 'individual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Advanced Permissions System Tables (Base)
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    CHECK (
        name IN (
            'admin',
            'receptionist',
            'student',
            'parent',
            'accountant',
            'teacher'
        )
    )
);

INSERT INTO roles (name)
VALUES ('admin'),
    ('receptionist'),
    ('student'),
    ('parent'),
    ('accountant'),
    ('teacher') ON DUPLICATE KEY
UPDATE name =
VALUES(name);


-- 3. Users Table (Updated with Role ID and Wallet Balance)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- 4. Core Educational Tables
CREATE TABLE programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_name VARCHAR(100) NOT NULL,
    program_type VARCHAR(50) NOT NULL,
    price_cash INT DEFAULT 0,
    price_installments INT DEFAULT 0
);

CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NULL,
    class_name VARCHAR(50) NOT NULL,
    level VARCHAR(50),
    age_group VARCHAR(50) NULL,
    capacity INT,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
);

CREATE TABLE parents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    parent_id INT,
    class_id INT,
    date_of_birth DATE,
    registration_date DATE,
    blood_group VARCHAR(5),
    medical_info TEXT,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE teachers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    specialty VARCHAR(100),
    hire_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Enrollment, Assignments, and Communications
CREATE TABLE student_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    program_id INT,
    class_id INT NULL,
    group_name VARCHAR(50),
    enrollment_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE teacher_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT,
    subject_id INT,
    class_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 6. Academic Operations (Resources, Grades, Attendance, Schedules)
CREATE TABLE resources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL,
    file_path_or_url VARCHAR(500) NOT NULL,
    file_size_mb DOUBLE DEFAULT 0,
    assignment_id INT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES teacher_assignments(id) ON DELETE SET NULL
);

CREATE TABLE assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100),
    type VARCHAR(50),
    max_grade DOUBLE DEFAULT 20.0,
    assignment_id INT,
    due_date DATE,
    FOREIGN KEY (assignment_id) REFERENCES teacher_assignments(id) ON DELETE CASCADE
);

CREATE TABLE grades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    assessment_id INT,
    grade_value DOUBLE NOT NULL,
    teacher_remarks TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    class_id INT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    is_justified BOOLEAN DEFAULT FALSE,
    justification_reason TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT,
    day_of_week ENUM(
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ) NOT NULL,
    start_time TIME,
    end_time TIME,
    room_number VARCHAR(20),
    FOREIGN KEY (assignment_id) REFERENCES teacher_assignments(id) ON DELETE CASCADE
);


-- 7. Financials (Fees, Payments)
CREATE TABLE user_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    from_user_id INT NOT NULL,
    to_user_id INT NOT NULL,
    amount INT NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    notes TEXT,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE student_fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    enrollment_id INT NULL,
    program_id INT,
    fee_type VARCHAR(50) NOT NULL,
    amount_due INT NOT NULL,
    applied_discount INT DEFAULT 0,
    due_date DATE,
    transaction_id INT,

    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollment_id) REFERENCES student_enrollments(id) ON DELETE SET NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL,
    FOREIGN KEY (transaction_id) REFERENCES user_transactions(id) ON DELETE SET NULL
);

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fee_id INT,
    transaction_id INT UNIQUE,
    amount_paid INT NOT NULL,
    installment_number INT DEFAULT 1,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    receipt_number VARCHAR(50) UNIQUE,

    FOREIGN KEY (fee_id) REFERENCES student_fees(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES user_transactions(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE INDEX idx_student_fees_student ON student_fees(student_id);
CREATE INDEX idx_student_fees_enrollment ON student_fees(enrollment_id);
CREATE INDEX idx_payments_fee ON payments(fee_id);
CREATE INDEX idx_transactions_from ON user_transactions(from_user_id);
CREATE INDEX idx_students_user ON students(user_id);
CREATE INDEX idx_teacher_user ON teachers(user_id);
CREATE INDEX idx_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX idx_classes_program ON classes(program_id);
CREATE INDEX idx_enrollments_student ON student_enrollments(student_id);
CREATE INDEX idx_enrollments_class_status ON student_enrollments(class_id, status);
CREATE INDEX idx_enrollments_program_class ON student_enrollments(program_id, class_id);
CREATE INDEX idx_attendance_class ON attendance(class_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student_class_date ON attendance(student_id, class_id, date);
