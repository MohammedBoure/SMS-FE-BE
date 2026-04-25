from .users_api import router as users_router
from .parents_api import router as parents_router
from .conversations_api import router as conversations_router
from .classes_api import router as classes_router
from .students_api import router as students_router
from .teachers_api import router as teachers_router
from .student_enrollments_api import router as student_enrollments_router
from .teacher_assignments_api import router as teacher_assignments_router
from .resources_api import router as resources_router
from .assessments_api import router as assessments_router
from .grades_api import router as grades_router
from .attendance_api import router as attendance_router
from .schedules_api import router as schedules_router
from .user_transactions_api import router as user_transactions_router
from .student_fees_api import router as student_fees_router
from .payments_api import router as payments_router
from .notifications_api import router as notifications_router
from .posts_api import router as posts_router
from .messages_api import router as messages_router

__all__ = [
    "users_router",
    "parents_router",
    "conversations_router",
    "classes_router",
    "students_router",
    "teachers_router",
    "student_enrollments_router",
    "teacher_assignments_router",
    "resources_router",
    "assessments_router",
    "grades_router",
    "attendance_router",
    "schedules_router",
    "user_transactions_router",
    "student_fees_router",
    "payments_router",
    "notifications_router",
    "posts_router",
    "messages_router",
]