import mysql.connector
import logging
import hashlib  
from typing import List, Dict, Optional

class UsersManager:
    def __init__(self, db_instance):
        self.db = db_instance

    def create_user(self, role_id: int, username: str, password: str, full_name: str, email: str = None, phone: str = None, address: str = None, is_active: bool = True) -> Optional[int]:
        try:
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = "INSERT INTO users (role_id, username, password, full_name, email, phone, address, is_active) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                params = (role_id, username, hashed_password, full_name, email, phone, address, is_active)
                cursor.execute(query, params)
                user_id = cursor.lastrowid
                conn.commit()
                return user_id
        except Exception:
            return None

    def authenticate_user(self, username: str, password: str) -> Optional[Dict]:
        try:
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT u.*, r.name AS role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = %s AND u.password = %s AND u.is_active = TRUE"
                cursor.execute(query, (username, hashed_password))
                return cursor.fetchone()
        except Exception:
            return None

    def get_all_users(self, role_name: str = None, is_active: bool = None, limit: int = 50, offset: int = 0) -> Dict:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT u.id, u.username, u.full_name, u.email, u.phone, u.is_active, u.created_at, r.name AS role_name, r.id AS role_id FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE 1=1"
                count_query = "SELECT COUNT(*) as total FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE 1=1"
                params = []

                if role_name:
                    query += " AND r.name = %s"
                    count_query += " AND r.name = %s"
                    params.append(role_name)
                
                if is_active is not None:
                    query += " AND u.is_active = %s"
                    count_query += " AND u.is_active = %s"
                    params.append(is_active)

                cursor.execute(count_query, tuple(params))
                total_count = cursor.fetchone()['total']

                query += " ORDER BY u.created_at DESC LIMIT %s OFFSET %s"
                params.extend([limit, offset])
                
                cursor.execute(query, tuple(params))
                return {"data": cursor.fetchall(), "total": total_count}
        except Exception:
            return {"data": [], "total": 0}

    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT u.*, r.name AS role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.id = %s"
                cursor.execute(query, (user_id,))
                return cursor.fetchone()
        except Exception:
            return None

    def search_users(self, keyword: str, limit: int = 50, offset: int = 0) -> Dict:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT u.id, u.username, u.full_name, u.email, u.phone, u.is_active, r.name AS role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username LIKE %s OR u.full_name LIKE %s OR u.email LIKE %s ORDER BY u.full_name ASC"
                count_query = "SELECT COUNT(*) as total FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username LIKE %s OR u.full_name LIKE %s OR u.email LIKE %s"
                like_pattern = f"%{keyword}%"
                params = [like_pattern, like_pattern, like_pattern]
                
                cursor.execute(count_query, tuple(params))
                total_count = cursor.fetchone()['total']

                query += " LIMIT %s OFFSET %s"
                params.extend([limit, offset])

                cursor.execute(query, tuple(params))
                return {"data": cursor.fetchall(), "total": total_count}
        except Exception:
            return {"data": [], "total": 0}

    def update_user(self, user_id: int, **kwargs) -> bool:
        if not kwargs:
            return False

        allowed_fields = {'role_id', 'username', 'password', 'full_name', 'email', 'phone', 'address', 'is_active'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields:
            return False

        params.append(user_id)
        
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                return cursor.rowcount > 0
        except Exception:
            return False

    def change_user_status(self, user_id: int, is_active: bool) -> bool:
        return self.update_user(user_id, is_active=is_active)

    def delete_user(self, user_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT username FROM users WHERE id = %s", (user_id,))
                user = cursor.fetchone()
                if user and user[0] == 'admin':
                    return False, "Error"

                cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
                conn.commit()
                if cursor.rowcount > 0:
                    return True, "Success"
                return False, "Error"
        except Exception:
            return False, "Error"