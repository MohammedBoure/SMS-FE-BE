"""
database.py
-----------
الكلاس الرئيسي Database — Singleton يجمع كل المكوّنات:
  ┌─ ConnectionManager  → Pool + SQLAlchemy Engine
  └─ SchemaInitializer  → تهيئة الجداول والـ Views

الاستيراد من أي مكان في التطبيق:
    from database.database import Database
أو عبر الاختصار في __init__.py:
    from database import Database
"""

import logging
import mysql.connector

from .config import (
    get_external_path,
    TABLE_IMPORT_ORDER,
    ARCHIVE_VIEW_FLAG_FILE,
    HARD_RESET_PASSWORD,
    CustomJSONEncoder,
)
from .connection import ConnectionManager, load_db_config, ensure_database_exists
from .schema_initializer import SchemaInitializer

logger = logging.getLogger("SCHOOL_SYS")


class Database:
    """
    Singleton رئيسي للتطبيق.
    يُعيد نفس الكائن في كل مكان يُستدعى فيه Database().
    """

    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        # تجنّب إعادة التهيئة عند استدعاء Database() أكثر من مرة
        if hasattr(self, '_initialized'):
            return

        db_config = load_db_config()
        ensure_database_exists(db_config)

        # ── المكوّنات الداخلية ──────────────────────────────────────────────
        self._conn_mgr = ConnectionManager(db_config)
        self._schema   = SchemaInitializer(self._conn_mgr)

        # كشف مباشر لـ engine (يحتاجه بعض الـ managers)
        self.engine = self._conn_mgr.engine

        self._schema.initialize()
        self._initialized = True

    # ==========================================================
    # واجهة الاتصال
    # ==========================================================
    def get_db_connection(self):
        """Context manager يُعيد اتصالاً من الـ Pool مع auto-commit/rollback."""
        return self._conn_mgr.get_db_connection()

    def get_raw_connection(self):
        """اتصال خام من الـ Pool (المستدعي مسؤول عن conn.close())."""
        return self._conn_mgr.get_raw_connection()

    # ==========================================================
    # إعادة ضبط قاعدة البيانات
    # ==========================================================
    def hard_reset_database(self, password: str) -> tuple:
        if password != HARD_RESET_PASSWORD:
            return False, "كلمة المرور غير صحيحة. تم إلغاء العملية."
        try:
            with self.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

                cursor.execute("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")
                for (table_name, _) in cursor.fetchall():
                    cursor.execute(f"DROP TABLE IF EXISTS `{table_name}`")

                cursor.execute("SHOW FULL TABLES WHERE Table_type = 'VIEW'")
                for (view_name, _) in cursor.fetchall():
                    cursor.execute(f"DROP VIEW IF EXISTS `{view_name}`")

                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                conn.commit()

            self._schema.initialize()
            return True, "تم مسح جميع البيانات وإعادة تهيئة قاعدة البيانات بنجاح."
        except Exception as e:
            return False, f"حدث خطأ أثناء مسح البيانات: {e}"

    def truncate_all_tables(self, password: str) -> tuple:
        """اختصار للتوافق مع الكود القديم."""
        return self.hard_reset_database(password)
