# apis/dependencies.py

from typing import Optional

from database import Database
from database import (
    SubjectsManager,
    ConversationsManager,
    UsersManager,
    ProgramsManager,
    ClassesManager,
    ParentsManager,
    StudentsManager,
    TeachersManager,
    StudentEnrollmentsManager,
    TeacherAssignmentsManager,
    ResourcesManager,
    AssessmentsManager,
    GradesManager,
    AttendanceManager,
    SchedulesManager,
    UserTransactionsManager,
    StudentFeesManager,
    PaymentsManager,
    NotificationsManager,
    MessagesManager,
    PostsManager
)

db_instance: Optional[Database] = None


def get_database() -> Database:
    global db_instance
    if db_instance is None:
        db_instance = Database()
    return db_instance


def get_users_manager() -> UsersManager:
    return UsersManager(get_database())

def get_parents_manager() -> ParentsManager:
    return ParentsManager(get_database())

def get_conversations_manager() -> ConversationsManager:
    return ConversationsManager(get_database())

def get_notifications_manager() -> NotificationsManager:
    return NotificationsManager(get_database())

def get_programs_manager() -> ProgramsManager:
    return ProgramsManager(get_database())

def get_classes_manager() -> ClassesManager:
    return ClassesManager(get_database())

def get_subjects_manager() -> SubjectsManager:
    return SubjectsManager(get_database())

def get_students_manager() -> StudentsManager:
    return StudentsManager(get_database())

def get_teachers_manager() -> TeachersManager:
    return TeachersManager(get_database())

def get_student_enrollments_manager() -> StudentEnrollmentsManager:
    return StudentEnrollmentsManager(get_database())

def get_teacher_assignments_manager() -> TeacherAssignmentsManager:
    return TeacherAssignmentsManager(get_database())

def get_schedules_manager() -> SchedulesManager:
    return SchedulesManager(get_database())

def get_attendance_manager() -> AttendanceManager:
    return AttendanceManager(get_database())

def get_assessments_manager() -> AssessmentsManager:
    return AssessmentsManager(get_database())

def get_grades_manager() -> GradesManager:
    return GradesManager(get_database())

def get_resources_manager() -> ResourcesManager:
    return ResourcesManager(get_database())

def get_user_transactions_manager() -> UserTransactionsManager:
    return UserTransactionsManager(get_database())

def get_student_fees_manager() -> StudentFeesManager:
    return StudentFeesManager(get_database())

def get_payments_manager() -> PaymentsManager:
    return PaymentsManager(get_database())

def get_posts_manager() -> PostsManager:
    return PostsManager(get_database())

def get_messages_manager() -> MessagesManager:
    return MessagesManager(get_database())
