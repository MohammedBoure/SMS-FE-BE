# database/posts_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional

class PostsManager:
    def __init__(self, db_instance):
        self.db = db_instance

    def create_post(self, title: str, content: str, user_id: int, image: str = None) -> Optional[int]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO posts (title, content, user_id, image)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(query, (title, content, user_id, image))
                post_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Post créé : [{post_id}] '{title}' par l'utilisateur #{user_id}")
                return post_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur création post : {e}")
            return None

    def get_all_posts(self) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT p.*, u.full_name AS author_name, u.username
                    FROM posts p
                    JOIN users u ON p.user_id = u.id
                    ORDER BY p.created_at DESC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération posts : {e}")
            return []

    def get_post_by_id(self, post_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT p.*, u.full_name AS author_name
                    FROM posts p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.id = %s
                """
                cursor.execute(query, (post_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération post #{post_id} : {e}")
            return None

    def get_posts_by_user(self, user_id: int) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT * FROM posts WHERE user_id = %s ORDER BY created_at DESC"
                cursor.execute(query, (user_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération posts (Utilisateur #{user_id}) : {e}")
            return []

    def update_post(self, post_id: int, **kwargs) -> bool:
        if not kwargs:
            return False
        allowed_fields = {'title', 'content', 'image'}
        update_fields = []
        params = []
        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)
        if not update_fields: return False
        params.append(post_id)
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE posts SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                return cursor.rowcount > 0
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour post #{post_id} : {e}")
            return False

    def delete_post(self, post_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM posts WHERE id = %s", (post_id,))
                conn.commit()
                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Post #{post_id} supprimé.")
                    return True, "Post supprimé avec succès."
                return False, "Post introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression post #{post_id} : {e}")
            return False, f"Erreur base de données : {e}"