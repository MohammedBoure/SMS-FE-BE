"""
config.py
---------
إعدادات النظام العامة: الترميز، السجلات، الثوابت، والمشفر المخصص.
يُستورد من جميع الملفات الأخرى.
"""

import sys
import codecs
import logging
import os
import json
from datetime import datetime, date
from decimal import Decimal


# ─── Force UTF-8 Encoding ────────────────────────────────────────────────────
try:
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
except (AttributeError, TypeError):
    try:
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')
    except Exception as e:
        print(f"Warning: Could not force console to UTF-8. {e}")


# ─── Logging Setup ────────────────────────────────────────────────────────────
def get_external_path(filename: str) -> str:
    """يعيد مسار الملف سواء كان التطبيق مجمّعاً (PyInstaller) أو لا."""
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(os.path.dirname(sys.executable), filename)
    return os.path.join(os.path.abspath("."), filename)


root_logger = logging.getLogger()
if root_logger.hasHandlers():
    for handler in root_logger.handlers:
        root_logger.removeHandler(handler)

log_file = get_external_path("logs.log")
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(log_file, encoding='utf-8')
    ]
)
logger = logging.getLogger("SCHOOL_SYS")


# ─── Constants ────────────────────────────────────────────────────────────────
TABLE_IMPORT_ORDER = [
    'roles', 'users', 'posts', 'messages', 'subjects', 'conversations',
    'programs', 'classes', 'parents', 'students', 'teachers',
    'student_enrollments', 'teacher_assignments',
    'resources', 'assessments', 'grades', 'attendance', 'schedules',
    'user_transactions', 'student_fees', 'payments', 'notifications',
]

ARCHIVE_VIEW_FLAG_FILE = 'archive_view.flag'

HARD_RESET_PASSWORD = "SchoolResetPassword123!"


# ─── Custom JSON Encoder ──────────────────────────────────────────────────────
class CustomJSONEncoder(json.JSONEncoder):
    """يحوّل datetime وDecimal إلى أنواع قابلة للتسلسل JSON."""

    def default(self, obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        if isinstance(obj, Decimal):
            return float(obj)
        return super().default(obj)
