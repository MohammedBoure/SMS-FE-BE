"""
views_indexes.py
----------------
تعريفات Views و Indexes لقاعدة البيانات المدرسية.
"""

# ============================================================
# Views (مشاهد SQL)
# ============================================================
VIEW_QUERIES = [
    # ملخص رصيد الطالب: الرسوم المستحقة، المدفوعة، والمتبقية
    """CREATE OR REPLACE VIEW StudentFeesSummaryView AS
    SELECT
        s.id                                  AS student_id,
        u.full_name                           AS student_name,
        se.id                                 AS enrollment_id,
        prog.program_name,
        c.class_name,
        COALESCE(SUM(sf.amount_due), 0)       AS total_fees_due,
        COALESCE(SUM(sf.applied_discount), 0) AS total_discounts,
        COALESCE(SUM(pp.total_paid), 0)       AS total_paid,
        (COALESCE(SUM(sf.amount_due), 0)
         - COALESCE(SUM(sf.applied_discount), 0)
         - COALESCE(SUM(pp.total_paid), 0))   AS balance_remaining
    FROM student_fees sf
    JOIN students s ON s.id = sf.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN student_enrollments se ON se.id = sf.enrollment_id
    LEFT JOIN programs prog ON prog.id = COALESCE(sf.program_id, se.program_id)
    LEFT JOIN classes c ON c.id = se.class_id
    LEFT JOIN (
        SELECT fee_id, SUM(amount_paid) AS total_paid
        FROM payments
        GROUP BY fee_id
    ) pp ON pp.fee_id = sf.id
    GROUP BY s.id, u.full_name, se.id, prog.program_name, c.class_name;""",

    # معدل درجات كل طالب لكل مادة
    """CREATE OR REPLACE VIEW StudentGradesAverageView AS
    SELECT
        s.id                          AS student_id,
        u.full_name                   AS student_name,
        sub.subject_name,
        ROUND(AVG(g.grade_value), 2)  AS average_grade,
        COUNT(g.id)                   AS assessments_count
    FROM grades g
    JOIN students   s   ON s.id   = g.student_id
    JOIN users      u   ON u.id   = s.user_id
    JOIN assessments a  ON a.id   = g.assessment_id
    JOIN teacher_assignments ta ON ta.id = a.assignment_id
    JOIN subjects   sub ON sub.id = ta.subject_id
    GROUP BY s.id, u.full_name, sub.subject_name;""",

    # إحصائيات الحضور لكل طالب
    """CREATE OR REPLACE VIEW StudentAttendanceSummaryView AS
    SELECT
        s.id                                                        AS student_id,
        u.full_name                                                 AS student_name,
        COUNT(a.id)                                                 AS total_sessions,
        SUM(a.status = 'present')                                   AS present_count,
        SUM(a.status = 'absent')                                    AS absent_count,
        SUM(a.status = 'absent' AND a.is_justified = TRUE)          AS justified_absences,
        ROUND(SUM(a.status = 'present') / COUNT(a.id) * 100, 1)    AS attendance_rate_pct
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    JOIN users    u ON u.id = s.user_id
    GROUP BY s.id, u.full_name;""",
]

# ============================================================
# Indexes (فهارس الأداء)
# ============================================================
INDEX_QUERIES = [
    "CREATE INDEX idx_student_fees_student ON student_fees(student_id);",
    "CREATE INDEX idx_student_fees_enrollment ON student_fees(enrollment_id);",
    "CREATE INDEX idx_payments_fee         ON payments(fee_id);",
    "CREATE INDEX idx_transactions_from    ON user_transactions(from_user_id);",
    "CREATE INDEX idx_students_user        ON students(user_id);",
    "CREATE INDEX idx_teacher_user         ON teachers(user_id);",
    "CREATE INDEX idx_assignments_teacher  ON teacher_assignments(teacher_id);",
    "CREATE INDEX idx_classes_program      ON classes(program_id);",
    "CREATE INDEX idx_enrollments_student  ON student_enrollments(student_id);",
    "CREATE INDEX idx_enrollments_class_status ON student_enrollments(class_id, status);",
    "CREATE INDEX idx_enrollments_program_class ON student_enrollments(program_id, class_id);",
    "CREATE INDEX idx_grades_student       ON grades(student_id);",
    "CREATE INDEX idx_attendance_student   ON attendance(student_id);",
    "CREATE INDEX idx_attendance_class     ON attendance(class_id);",
    "CREATE INDEX idx_attendance_date      ON attendance(date);",
    "CREATE INDEX idx_attendance_student_class_date ON attendance(student_id, class_id, date);",
    "CREATE INDEX idx_notifications_user   ON notifications(user_id);",
    "CREATE INDEX idx_posts_user_id        ON posts(user_id);",
    "CREATE INDEX idx_messages_sender_id   ON messages(sender_id);",
    "CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);",
]
