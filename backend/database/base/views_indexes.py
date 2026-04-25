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
        s.id                                          AS student_id,
        u.full_name                                   AS student_name,
        c.class_name,
        COALESCE(SUM(sf.amount_due), 0)               AS total_fees_due,
        COALESCE(SUM(sf.applied_discount), 0)         AS total_discounts,
        COALESCE(SUM(p.amount_paid), 0)               AS total_paid,
        (COALESCE(SUM(sf.amount_due), 0)
         - COALESCE(SUM(sf.applied_discount), 0)
         - COALESCE(SUM(p.amount_paid), 0))           AS balance_remaining
    FROM students s
    JOIN users    u  ON u.id = s.user_id
    LEFT JOIN classes c  ON c.id = s.class_id
    LEFT JOIN student_fees sf ON sf.student_id = s.id
    LEFT JOIN payments     p  ON p.fee_id      = sf.id
    GROUP BY s.id, u.full_name, c.class_name;""",

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
    "CREATE INDEX idx_payments_fee         ON payments(fee_id);",
    "CREATE INDEX idx_transactions_from    ON user_transactions(from_user_id);",
    "CREATE INDEX idx_students_user        ON students(user_id);",
    "CREATE INDEX idx_teacher_user         ON teachers(user_id);",
    "CREATE INDEX idx_assignments_teacher  ON teacher_assignments(teacher_id);",
    "CREATE INDEX idx_grades_student       ON grades(student_id);",
    "CREATE INDEX idx_attendance_student   ON attendance(student_id);",
    "CREATE INDEX idx_attendance_date      ON attendance(date);",
    "CREATE INDEX idx_notifications_user   ON notifications(user_id);",
]
