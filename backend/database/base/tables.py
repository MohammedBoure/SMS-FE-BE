"""
tables.py
---------
"""


REFERENCE_TABLE_QUERIES = [
    """CREATE TABLE IF NOT EXISTS subjects (
        id           INT PRIMARY KEY AUTO_INCREMENT,
        subject_name VARCHAR(100) NOT NULL,
        description  TEXT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS conversations (
        id         INT PRIMARY KEY AUTO_INCREMENT,
        title      VARCHAR(255),
        type       VARCHAR(20) DEFAULT 'individual',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
]

ROLES_USERS_TABLE_QUERIES = [
    """CREATE TABLE roles (
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
    );""",
    
    """INSERT INTO roles (name)
    VALUES ('admin'),
        ('receptionist'),
        ('student'),
        ('parent'),
        ('accountant'),
        ('teacher') ON DUPLICATE KEY
    UPDATE name = VALUES(name);""",

    """CREATE TABLE IF NOT EXISTS users (
        id         INT PRIMARY KEY AUTO_INCREMENT,
        role_id    INT,
        username   VARCHAR(50)  UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        email      VARCHAR(100) UNIQUE,
        full_name  VARCHAR(100) NOT NULL,
        phone      VARCHAR(20),
        address    TEXT,
        is_active  BOOLEAN   DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    # --- Default Accounts for Testing (Password: 'python') ---
    """INSERT IGNORE INTO users (role_id, username, password, email, full_name, is_active)
    VALUES 
    ((SELECT id FROM roles WHERE name='admin'), 'admin', '11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1', 'admin_test@gmail.com', 'System Administrator', 1),
    ((SELECT id FROM roles WHERE name='receptionist'), 'reception', '11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1', 'reception@gmail.com', 'Front Desk Officer', 1),
    ((SELECT id FROM roles WHERE name='teacher'), 'teacher', '11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1', 'teacher@gmail.com', 'Subject Teacher', 1),
    ((SELECT id FROM roles WHERE name='student'), 'student', '11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1', 'student@gmail.com', 'School Student', 1),
    ((SELECT id FROM roles WHERE name='parent'), 'parent', '11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1', 'parent@gmail.com', 'Student Parent', 1),
    ((SELECT id FROM roles WHERE name='accountant'), 'accountant', '11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1', 'accountant@gmail.com', 'Financial Accountant', 1);"""
]


CORE_EDUCATION_TABLE_QUERIES = [
    """CREATE TABLE IF NOT EXISTS programs (
        id                  INT PRIMARY KEY AUTO_INCREMENT,
        program_name        VARCHAR(100) NOT NULL,
        program_type        VARCHAR(50)  NOT NULL,
        price_cash          INT DEFAULT 0,
        price_installments  INT DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS classes (
        id         INT PRIMARY KEY AUTO_INCREMENT,
        program_id INT NULL,
        class_name VARCHAR(50) NOT NULL,
        level      VARCHAR(50),
        age_group  VARCHAR(50) NULL,
        capacity   INT,
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS parents (
        id      INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS students (
        id                INT PRIMARY KEY AUTO_INCREMENT,
        user_id           INT UNIQUE,
        parent_id         INT,
        class_id          INT,
        date_of_birth     DATE,
        registration_date DATE,
        blood_group       VARCHAR(5),
        medical_info      TEXT,
        status            VARCHAR(20) DEFAULT 'active',
        FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES parents(id)  ON DELETE SET NULL,
        FOREIGN KEY (class_id)  REFERENCES classes(id)  ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS teachers (
        id         INT PRIMARY KEY AUTO_INCREMENT,
        user_id    INT UNIQUE,
        specialty  VARCHAR(100),
        hire_date  DATE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """INSERT IGNORE INTO teachers (user_id, specialty, hire_date) 
       SELECT id, 'Mathématiques', CURDATE() FROM users WHERE username = 'teacher_user';""",
       
    """INSERT IGNORE INTO students (user_id, date_of_birth, registration_date, status) 
       SELECT id, '2010-01-01', CURDATE(), 'active' FROM users WHERE username = 'student_user';""",
       
    """INSERT IGNORE INTO parents (user_id) 
       SELECT id FROM users WHERE username = 'parent_user';"""
]

ENROLLMENT_ASSIGNMENT_TABLE_QUERIES = [
    """CREATE TABLE IF NOT EXISTS student_enrollments (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        student_id      INT,
        program_id      INT,
        class_id        INT NULL,
        group_name      VARCHAR(50),
        enrollment_date DATE,
        status          VARCHAR(50) DEFAULT 'active',
        notes           TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id)   REFERENCES classes(id)  ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS teacher_assignments (
        id         INT PRIMARY KEY AUTO_INCREMENT,
        teacher_id INT,
        subject_id INT,
        class_id   INT,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id)  ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id)  ON DELETE CASCADE,
        FOREIGN KEY (class_id)   REFERENCES classes(id)   ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
]


ACADEMIC_OPERATIONS_TABLE_QUERIES = [
    """CREATE TABLE IF NOT EXISTS resources (
        id                  INT PRIMARY KEY AUTO_INCREMENT,
        title               VARCHAR(255) NOT NULL,
        description         TEXT,
        resource_type       VARCHAR(50)  NOT NULL,
        file_path_or_url    VARCHAR(500) NOT NULL,
        file_size_mb        DOUBLE DEFAULT 0,
        assignment_id       INT,
        upload_date         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assignment_id) REFERENCES teacher_assignments(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS assessments (
        id            INT PRIMARY KEY AUTO_INCREMENT,
        title         VARCHAR(100),
        type          VARCHAR(50),
        max_grade     DOUBLE DEFAULT 20.0,
        assignment_id INT,
        due_date      DATE,
        FOREIGN KEY (assignment_id) REFERENCES teacher_assignments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS grades (
        id              INT PRIMARY KEY AUTO_INCREMENT,
        student_id      INT,
        assessment_id   INT,
        grade_value     DOUBLE NOT NULL,
        teacher_remarks TEXT,
        FOREIGN KEY (student_id)    REFERENCES students(id)    ON DELETE CASCADE,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS attendance (
        id                   INT PRIMARY KEY AUTO_INCREMENT,
        student_id           INT,
        class_id             INT NULL,
        date                 DATE    NOT NULL,
        status               VARCHAR(20) NOT NULL,
        is_justified         BOOLEAN DEFAULT FALSE,
        justification_reason TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id)   REFERENCES classes(id)  ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS schedules (
        id            INT PRIMARY KEY AUTO_INCREMENT,
        assignment_id INT,
        day_of_week   ENUM('Sunday','Monday','Tuesday','Wednesday',
                           'Thursday','Friday','Saturday') NOT NULL,
        start_time    TIME,
        end_time      TIME,
        room_number   VARCHAR(20),
        FOREIGN KEY (assignment_id) REFERENCES teacher_assignments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
]

FINANCIAL_TABLE_QUERIES = [
    """CREATE TABLE IF NOT EXISTS user_transactions (
        id               INT PRIMARY KEY AUTO_INCREMENT,
        from_user_id     INT NOT NULL,
        to_user_id       INT NOT NULL,
        amount           INT NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        reference_type   VARCHAR(50),
        reference_id     INT,
        notes            TEXT,
        status           ENUM('pending','completed','cancelled') DEFAULT 'completed',
        created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id)   REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS student_fees (
        id               INT PRIMARY KEY AUTO_INCREMENT,
        student_id       INT,
        enrollment_id    INT NULL,
        program_id       INT,
        fee_type         VARCHAR(50) NOT NULL,
        amount_due       INT NOT NULL,
        applied_discount INT DEFAULT 0,
        due_date         DATE,
        transaction_id   INT,
        FOREIGN KEY (student_id)     REFERENCES students(id)          ON DELETE CASCADE,
        FOREIGN KEY (enrollment_id)  REFERENCES student_enrollments(id) ON DELETE SET NULL,
        FOREIGN KEY (program_id)     REFERENCES programs(id)          ON DELETE SET NULL,
        FOREIGN KEY (transaction_id) REFERENCES user_transactions(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS payments (
        id                 INT PRIMARY KEY AUTO_INCREMENT,
        fee_id             INT,
        transaction_id     INT UNIQUE,
        amount_paid        INT NOT NULL,
        installment_number INT DEFAULT 1,
        payment_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        receipt_number     VARCHAR(50) UNIQUE,
        FOREIGN KEY (fee_id)         REFERENCES student_fees(id)      ON DELETE CASCADE,
        FOREIGN KEY (transaction_id) REFERENCES user_transactions(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS notifications (
        id         INT PRIMARY KEY AUTO_INCREMENT,
        user_id    INT,
        title      VARCHAR(255),
        message    TEXT,
        is_read    BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",
]

COMMUNICATION_TABLE_QUERIES = [
    """CREATE TABLE IF NOT EXISTS posts (
        id         INT PRIMARY KEY AUTO_INCREMENT,
        title      VARCHAR(255) NOT NULL,
        content    TEXT NOT NULL,
        image      VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id    INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;""",

    """CREATE TABLE IF NOT EXISTS messages (
        id          INT PRIMARY KEY AUTO_INCREMENT,
        content     TEXT NOT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        sender_id   INT NOT NULL,
        receiver_id INT NOT NULL,
        FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"""
]
