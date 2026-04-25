import mysql.connector
import logging
from typing import List, Dict, Optional

class MessagesManager:
    def __init__(self, db_instance):
        self.db = db_instance

    def send_message(self, sender_id: int, receiver_id: int, content: str) -> Optional[int]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO messages (sender_id, receiver_id, content)
                    VALUES (%s, %s, %s)
                """
                cursor.execute(query, (sender_id, receiver_id, content))
                message_id = cursor.lastrowid
                conn.commit()
                logging.info(f"Message sent:[{message_id}] From user #{sender_id} to #{receiver_id}")
                return message_id
        except mysql.connector.Error as e:
            logging.error(f"Error sending message: {e}")
            return None

    def get_message_by_id(self, message_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        m.*,
                        s.full_name AS sender_name,
                        r.full_name AS receiver_name
                    FROM messages m
                    JOIN users s ON m.sender_id = s.id
                    JOIN users r ON m.receiver_id = r.id
                    WHERE m.id = %s
                """
                cursor.execute(query, (message_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"Error retrieving message #{message_id}: {e}")
            return None

    def get_conversation(self, user1_id: int, user2_id: int) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        m.id, m.content, m.created_at, m.sender_id, m.receiver_id,
                        s.full_name AS sender_name,
                        r.full_name AS receiver_name
                    FROM messages m
                    JOIN users s ON m.sender_id = s.id
                    JOIN users r ON m.receiver_id = r.id
                    WHERE (m.sender_id = %s AND m.receiver_id = %s)
                       OR (m.sender_id = %s AND m.receiver_id = %s)
                    ORDER BY m.created_at ASC
                """
                cursor.execute(query, (user1_id, user2_id, user2_id, user1_id))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error retrieving conversation ({user1_id} <-> {user2_id}): {e}")
            return[]

    def get_user_inbox(self, user_id: int) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        m.id, m.content, m.created_at, m.sender_id, m.receiver_id,
                        s.full_name AS sender_name,
                        r.full_name AS receiver_name
                    FROM messages m
                    JOIN users s ON m.sender_id = s.id
                    JOIN users r ON m.receiver_id = r.id
                    WHERE m.sender_id = %s OR m.receiver_id = %s
                    ORDER BY m.created_at DESC
                """
                cursor.execute(query, (user_id, user_id))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error retrieving inbox for user #{user_id}: {e}")
            return