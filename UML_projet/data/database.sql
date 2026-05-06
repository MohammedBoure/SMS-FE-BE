-- 1. Independent Tables (No Foreign Keys)
CREATE TABLE branches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    branch_type VARCHAR(50) NOT NULL,
    location VARCHAR(255)
);

CREATE TABLE academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    year_name VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE financial_policies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    policy_name VARCHAR(100) NOT NULL,
    discount_percentage DOUBLE DEFAULT 0,
    discount_fixed_amount DOUBLE DEFAULT 0
);

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
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE
);

CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    permission_group VARCHAR(50) NOT NULL,
    permission_key VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    UNIQUE (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 3. Users Table (Updated with Role ID and Wallet Balance)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    role_id INT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    full_name_ar VARCHAR(100),
    full_name_fr VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    wallet_balance DOUBLE DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
);

-- 4. Core Educational Tables
CREATE TABLE programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    program_name VARCHAR(100) NOT NULL,
    program_type VARCHAR(50) NOT NULL,
    price_cash DOUBLE DEFAULT 0,
    price_installments DOUBLE DEFAULT 0,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    class_name VARCHAR(50) NOT NULL,
    level VARCHAR(50),
    age_group VARCHAR(50) NULL,
    capacity INT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
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
    policy_id INT,
    date_of_birth DATE,
    registration_date DATE,
    blood_group VARCHAR(5),
    medical_info TEXT,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
    FOREIGN KEY (policy_id) REFERENCES financial_policies(id) ON DELETE SET NULL
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
    academic_year_id INT,
    group_name VARCHAR(50),
    enrollment_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL
);

CREATE TABLE teacher_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    teacher_id INT,
    subject_id INT,
    class_id INT,
    academic_year_id INT,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

CREATE TABLE conversation_participants (
    conversation_id INT,
    user_id INT,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT,
    sender_id INT,
    message_text TEXT,
    attachment_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
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
    academic_year_id INT,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    is_justified BOOLEAN DEFAULT FALSE,
    justification_reason TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE
);

CREATE TABLE schedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT,
    day_of_week VARCHAR(20),
    start_time TIME,
    end_time TIME,
    room_number VARCHAR(20),
    FOREIGN KEY (assignment_id) REFERENCES teacher_assignments(id) ON DELETE CASCADE
);

-- 7. Financials (Fees, Payments, Payrolls, Expenses)
CREATE TABLE student_fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT,
    academic_year_id INT,
    program_id INT,
    fee_type VARCHAR(50) NOT NULL,
    amount_due DOUBLE NOT NULL,
    applied_discount DOUBLE DEFAULT 0,
    is_previous_debt BOOLEAN DEFAULT FALSE,
    due_date DATE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
);

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fee_id INT,
    amount_paid DOUBLE NOT NULL,
    installment_number INT DEFAULT 1,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    receipt_number VARCHAR(50) UNIQUE,
    FOREIGN KEY (fee_id) REFERENCES student_fees(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    amount DOUBLE NOT NULL,
    category VARCHAR(100),
    description TEXT,
    expense_date DATE,
    created_by INT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE payrolls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    branch_id INT,
    program_id INT,
    month_name VARCHAR(20),
    calculation_method VARCHAR(50) NOT NULL,
    sessions_count INT DEFAULT 0,
    students_count INT DEFAULT 0,
    unit_rate DOUBLE DEFAULT 0,
    base_salary DOUBLE DEFAULT 0,
    bonuses DOUBLE DEFAULT 0,
    advances DOUBLE DEFAULT 0,
    deductions DOUBLE DEFAULT 0,
    previous_arrears DOUBLE DEFAULT 0,
    net_salary DOUBLE NOT NULL,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
);

CREATE TABLE external_obligations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    obligation_type VARCHAR(50) NOT NULL,
    beneficiary VARCHAR(150),
    month_name VARCHAR(20),
    amount_due DOUBLE NOT NULL,
    amount_paid DOUBLE DEFAULT 0,
    due_date DATE,
    notes TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE daily_consumptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    consumption_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    item_name VARCHAR(100),
    quantity DOUBLE,
    unit_price DOUBLE,
    total_cost DOUBLE NOT NULL,
    meal_type VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

CREATE TABLE cash_handovers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    branch_id INT,
    handover_date DATE NOT NULL,
    amount DOUBLE NOT NULL,
    receiver_name VARCHAR(100),
    receipt_reference VARCHAR(50),
    notes TEXT,
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 8. Inventory, Store, and Local Currency System
CREATE TABLE inventory_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    quantity_in_stock INT DEFAULT 0,
    unit_price DOUBLE,
    local_currency_price DOUBLE DEFAULT 0.0,
    reorder_level INT DEFAULT 5
);

CREATE TABLE inventory_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT,
    quantity INT,
    action_type VARCHAR(50),
    reference_id VARCHAR(100),
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
);

CREATE TABLE wallet_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    amount DOUBLE NOT NULL,
    transaction_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE store_purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    item_id INT,
    quantity INT NOT NULL,
    total_cost DOUBLE NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE RESTRICT
);

-- 9. System Logs and Notifications
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE system_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    level VARCHAR(20) NULL,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NULL,
    resource_id VARCHAR(50) NULL,
    payload JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    execution_time FLOAT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;