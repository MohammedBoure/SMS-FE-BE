"""
schema_initializer.py
---------------------
Executes all CREATE / INSERT / VIEW / INDEX queries
to initialize the database and create the default Admin user.
"""

import hashlib
import logging
import mysql.connector

from .tables import (
    REFERENCE_TABLE_QUERIES,
    ROLES_USERS_TABLE_QUERIES,
    CORE_EDUCATION_TABLE_QUERIES,
    ENROLLMENT_ASSIGNMENT_TABLE_QUERIES,
    ACADEMIC_OPERATIONS_TABLE_QUERIES,
    FINANCIAL_TABLE_QUERIES,
)
from .views_indexes import VIEW_QUERIES, INDEX_QUERIES

logger = logging.getLogger("SCHOOL_SYS")

ALL_SCHEMA_QUERIES = (
    REFERENCE_TABLE_QUERIES
    + ROLES_USERS_TABLE_QUERIES
    + CORE_EDUCATION_TABLE_QUERIES
    + ENROLLMENT_ASSIGNMENT_TABLE_QUERIES
    + ACADEMIC_OPERATIONS_TABLE_QUERIES
    + FINANCIAL_TABLE_QUERIES
)


class SchemaInitializer:
    """Performs full schema initialization on a given connection."""

    def __init__(self, connection_manager):
        self._cm = connection_manager

    def initialize(self) -> None:
        try:
            with self._cm.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")

                self._run_queries(cursor, ALL_SCHEMA_QUERIES, "Schema")
                self._run_queries(cursor, VIEW_QUERIES,       "Views")
                self._run_queries(cursor, INDEX_QUERIES,      "Indexes", ignore_errors=True)

                self._create_default_roles(cursor)
                self._create_default_admin(cursor)

                cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
                logger.info("✅ Schema initialized successfully.")

        except mysql.connector.Error as err:
            logger.error(f"❌ Failed to initialize schema: {err}")

    @staticmethod
    def _run_queries(cursor, queries: list, label: str, ignore_errors: bool = False) -> None:
        logger.info(f"Running {label} queries ({len(queries)} total)…")
        for query in queries:
            try:
                cursor.execute(query)
                while cursor.nextset():
                    pass
            except mysql.connector.Error as err:
                if ignore_errors:
                    continue
                logger.warning(f"{label} warning (safe to ignore for ALTER/INDEX): {err}")

    def _create_default_roles(self, cursor) -> None:
        """Adds default roles if they do not exist."""
        default_roles = [
            'student',
            'teacher',
            'admin',
            'accountant',
            'receptionist',
            'parent'
        ]
        try:
            for role_name in default_roles:
                cursor.execute(
                    """
                    INSERT IGNORE INTO roles (name)
                    VALUES (%s)
                    """,
                    (role_name,),
                )
        except Exception as e:
            logger.error(f"Error creating default roles: {e}")

    def _create_default_admin(self, cursor) -> None:
        """Creates a default Admin user if it does not exist."""
        try:
            cursor.execute("SELECT id FROM roles WHERE name = 'admin' LIMIT 1")
            row = cursor.fetchone()
            admin_role_id = row[0] if row else None

            password_hash = hashlib.sha256("python".encode()).hexdigest()
            cursor.execute(
                """
                INSERT INTO users (role_id, username, password, full_name, email, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    role_id   = VALUES(role_id),
                    password  = VALUES(password),  -- <--- أضف هذا السطر لضمان التحديث
                    full_name = VALUES(full_name)
                """,
                (admin_role_id, 'admin', password_hash, 'Administrator', 'admin123@school.local', True),
            )
        except Exception as e:
            logger.error(f"Error creating default admin: {e}")