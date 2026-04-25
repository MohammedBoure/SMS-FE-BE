# apis/dependencies.py

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

db_instance = Database()


def get_users_manager() -> UsersManager:
    return UsersManager(db_instance)

def get_parents_manager() -> ParentsManager:
    return ParentsManager(db_instance)

def get_conversations_manager() -> ConversationsManager:
    return ConversationsManager(db_instance)

def get_notifications_manager() -> NotificationsManager:
    return NotificationsManager(db_instance)

def get_programs_manager() -> ProgramsManager:
    return ProgramsManager(db_instance)

def get_classes_manager() -> ClassesManager:
    return ClassesManager(db_instance)

def get_subjects_manager() -> SubjectsManager:
    return SubjectsManager(db_instance)

def get_students_manager() -> StudentsManager:
    return StudentsManager(db_instance)

def get_teachers_manager() -> TeachersManager:
    return TeachersManager(db_instance)

def get_student_enrollments_manager() -> StudentEnrollmentsManager:
    return StudentEnrollmentsManager(db_instance)

def get_teacher_assignments_manager() -> TeacherAssignmentsManager:
    return TeacherAssignmentsManager(db_instance)

def get_schedules_manager() -> SchedulesManager:
    return SchedulesManager(db_instance)

def get_attendance_manager() -> AttendanceManager:
    return AttendanceManager(db_instance)

def get_assessments_manager() -> AssessmentsManager:
    return AssessmentsManager(db_instance)

def get_grades_manager() -> GradesManager:
    return GradesManager(db_instance)

def get_resources_manager() -> ResourcesManager:
    return ResourcesManager(db_instance)

def get_user_transactions_manager() -> UserTransactionsManager:
    return UserTransactionsManager(db_instance)

def get_student_fees_manager() -> StudentFeesManager:
    return StudentFeesManager(db_instance)

def get_payments_manager() -> PaymentsManager:
    return PaymentsManager(db_instance)

def get_posts_manager() -> PostsManager:
    return PostsManager(db_instance)

def get_messages_manager() -> MessagesManager:
    return MessagesManager(db_instance)