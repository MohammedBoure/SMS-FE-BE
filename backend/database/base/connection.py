"""
connection.py
-------------
إدارة Connection Pool (mysql-connector) و SQLAlchemy Engine.
هذا الملف مسؤول حصرياً عن الاتصال بقاعدة البيانات وإنشاء الجلسات.
"""

import os
import logging
import urllib.parse
from contextlib import contextmanager

import mysql.connector
from mysql.connector import pooling
from sqlalchemy import create_engine
from dotenv import load_dotenv

from .config import get_external_path

logger = logging.getLogger("SCHOOL_SYS")


def _read_int_env(name: str, default: int) -> int:
    value = os.getenv(name)
    if not value:
        return default
    try:
        return int(value)
    except ValueError as exc:
        raise ValueError(f"{name} must be a valid integer, got {value!r}") from exc


def _split_host_port(host_value: str, default_port: int) -> tuple[str, int | None]:
    """Accept DB_HOST as either host or host:port."""
    host_value = (host_value or "").strip()
    if not host_value:
        return "localhost", None

    # urlsplit needs a netloc marker to parse bare host:port values correctly.
    parsed = urllib.parse.urlsplit(
        host_value if "://" in host_value else f"//{host_value}"
    )
    host = parsed.hostname or host_value
    try:
        port = parsed.port
    except ValueError as exc:
        raise ValueError(f"DB_HOST contains an invalid port: {host_value!r}") from exc

    return host, port or default_port


def _config_from_database_url(database_url: str) -> dict:
    parsed = urllib.parse.urlparse(database_url)
    if not parsed.hostname:
        raise ValueError("DATABASE_URL must include a database host")

    return {
        'host': parsed.hostname,
        'user': urllib.parse.unquote(parsed.username or 'root'),
        'password': urllib.parse.unquote(parsed.password or ''),
        'database': urllib.parse.unquote(parsed.path.lstrip('/') or 'SchoolDB'),
        'port': parsed.port or 3306,
    }


class ConnectionManager:
    """
    يدير Connection Pool و SQLAlchemy Engine.
    يُستخدم داخل كلاس Database فقط.
    """

    _pool   = None
    _engine = None

    def __init__(self, db_config: dict):
        self.db_config = db_config
        self._init_pool()
        self._init_engine()

    # ── Pool ──────────────────────────────────────────────────────────────────
    def _init_pool(self) -> None:
        if ConnectionManager._pool is not None:
            return
        try:
            pool_size = int(os.getenv('DB_POOL_SIZE', 5))
            ConnectionManager._pool = pooling.MySQLConnectionPool(
                pool_name="school_pool",
                pool_size=pool_size,
                pool_reset_session=True,
                use_pure=True,
                auth_plugin='mysql_native_password',
                **self.db_config,
            )
            logger.info("🚀 Connection Pool initialized successfully.")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Connection Pool: {e}")
            raise

    # ── SQLAlchemy Engine ─────────────────────────────────────────────────────
    def _init_engine(self) -> None:
        if ConnectionManager._engine is not None:
            self.engine = ConnectionManager._engine
            return
        try:
            pw  = urllib.parse.quote_plus(self.db_config['password'])
            url = (
                f"mysql+mysqlconnector://{self.db_config['user']}:{pw}"
                f"@{self.db_config['host']}:{self.db_config['port']}"
                f"/{self.db_config['database']}"
            )
            ConnectionManager._engine = create_engine(
                url,
                connect_args={'use_pure': True, 'auth_plugin': 'mysql_native_password'},
                echo=False,
            )
            self.engine = ConnectionManager._engine
        except Exception as e:
            logger.error(f"Failed to create SQLAlchemy engine: {e}")
            raise

    # ── Context Manager ───────────────────────────────────────────────────────
    @contextmanager
    def get_db_connection(self):
        """Context manager مع auto-commit / auto-rollback."""
        conn = None
        try:
            conn = ConnectionManager._pool.get_connection()
            yield conn
            conn.commit()
        except mysql.connector.Error as err:
            logger.error(f"Database error: {err}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn and conn.is_connected():
                conn.close()

    def get_raw_connection(self):
        """اتصال خام — المستدعي مسؤول عن conn.close()."""
        return ConnectionManager._pool.get_connection()


# ── دوال مساعدة مستقلة ────────────────────────────────────────────────────────

def load_db_config() -> dict:
    """قراءة إعدادات الاتصال من ملف .env."""
    env_path = get_external_path(".env")
    load_dotenv(env_path)
    database_url = os.getenv('DATABASE_URL')
    if database_url:
        return _config_from_database_url(database_url)

    default_port = 3306
    host, host_port = _split_host_port(os.getenv('DB_HOST', 'localhost'), default_port)
    port = _read_int_env('DB_PORT', host_port or default_port)
    return {
        'host':     host,
        'user':     os.getenv('DB_USER', 'root'),
        'password': os.getenv('DB_PASSWORD', ''),
        'database': os.getenv('DB_NAME', 'SchoolDB'),
        'port':     port,
    }


def ensure_database_exists(db_config: dict) -> None:
    """ينشئ قاعدة البيانات إن لم تكن موجودة."""
    conn_cfg                = {k: v for k, v in db_config.items() if k != 'database'}
    conn_cfg['use_pure']    = True
    conn_cfg['auth_plugin'] = 'mysql_native_password'
    db_name = db_config['database']
    try:
        with mysql.connector.connect(**conn_cfg) as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS {db_name} "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            logger.info(f"✅ Database '{db_name}' verified/created.")
    except mysql.connector.Error as err:
        logger.error(f"❌ Could not verify/create database: {err}")
        raise
