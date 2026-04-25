"""
base.py  ←  ملف التوافق العكسي (Backward Compatibility Shim)
-------------------------------------------------------------
جميع الملفات الأخرى التي تستورد منه لن تحتاج أي تعديل:

    from database.base import Database           ✅ يعمل
    from database.base import CustomJSONEncoder  ✅ يعمل
    from database.base import TABLE_IMPORT_ORDER ✅ يعمل
    from database.base import get_external_path  ✅ يعمل
    from database.base import logger             ✅ يعمل

المنطق الفعلي موزّع على:
    database/database.py          ← Database class (Singleton)
    database/config.py            ← ثوابت + logging + CustomJSONEncoder
    database/connection.py        ← ConnectionManager
    database/schema_initializer.py ← تهيئة المخطط
    database/tables.py            ← تعريفات جداول SQL
    database/views_indexes.py     ← Views و Indexes
"""

from .database import Database                    # noqa: F401
from .config import (                             # noqa: F401
    get_external_path,
    TABLE_IMPORT_ORDER,
    ARCHIVE_VIEW_FLAG_FILE,
    HARD_RESET_PASSWORD,
    CustomJSONEncoder,
    logger,
)
