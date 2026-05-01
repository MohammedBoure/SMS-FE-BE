/*M!999999\- enable the sandbox mode */ 

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `SchoolDB` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `SchoolDB`;
DROP TABLE IF EXISTS `StudentAttendanceSummaryView`;
/*!50001 DROP VIEW IF EXISTS `StudentAttendanceSummaryView`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `StudentAttendanceSummaryView` AS SELECT
 1 AS `student_id`,
  1 AS `student_name`,
  1 AS `total_sessions`,
  1 AS `present_count`,
  1 AS `absent_count`,
  1 AS `justified_absences`,
  1 AS `attendance_rate_pct` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `StudentFeesSummaryView`;
/*!50001 DROP VIEW IF EXISTS `StudentFeesSummaryView`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `StudentFeesSummaryView` AS SELECT
 1 AS `student_id`,
  1 AS `student_name`,
  1 AS `class_name`,
  1 AS `total_fees_due`,
  1 AS `total_discounts`,
  1 AS `total_paid`,
  1 AS `balance_remaining` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `StudentGradesAverageView`;
/*!50001 DROP VIEW IF EXISTS `StudentGradesAverageView`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8mb4;
/*!50001 CREATE VIEW `StudentGradesAverageView` AS SELECT
 1 AS `student_id`,
  1 AS `student_name`,
  1 AS `subject_name`,
  1 AS `average_grade`,
  1 AS `assessments_count` */;
SET character_set_client = @saved_cs_client;
DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `max_grade` double DEFAULT 20,
  `assignment_id` int(11) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `teacher_assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES
(1,'Devoir Surveillé 1','exam',20,1,'2026-05-07'),
(2,'Devoir Surveillé 1','exam',20,2,'2026-05-07'),
(3,'Devoir Surveillé 1','exam',20,3,'2026-05-07'),
(4,'Devoir Surveillé 1','exam',20,4,'2026-05-07'),
(5,'Devoir Surveillé 1','exam',20,5,'2026-05-07'),
(6,'Devoir Surveillé 1','exam',20,6,'2026-05-07');
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `date` date NOT NULL,
  `status` varchar(20) NOT NULL,
  `is_justified` tinyint(1) DEFAULT 0,
  `justification_reason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_attendance_student` (`student_id`),
  KEY `idx_attendance_date` (`date`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES
(1,14,'2026-04-27','absent',0,NULL),
(2,2,'2026-04-27','absent',0,NULL),
(3,14,'2026-04-27','absent',1,NULL),
(4,4,'2026-04-21','absent',1,NULL),
(5,10,'2026-04-26','absent',0,NULL),
(6,4,'2026-04-24','absent',0,NULL),
(7,15,'2026-04-21','absent',0,NULL),
(8,12,'2026-04-28','absent',1,NULL);
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `classes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_name` varchar(50) NOT NULL,
  `level` varchar(50) DEFAULT NULL,
  `age_group` varchar(50) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `classes` WRITE;
/*!40000 ALTER TABLE `classes` DISABLE KEYS */;
INSERT INTO `classes` VALUES
(1,'1 AS - Tronc Commun','Secondaire',NULL,30),
(2,'2 AS - Sciences','Secondaire',NULL,30),
(3,'3 AS - Mathématiques','Secondaire',NULL,30);
/*!40000 ALTER TABLE `classes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(20) DEFAULT 'individual',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `assessment_id` int(11) DEFAULT NULL,
  `grade_value` double NOT NULL,
  `teacher_remarks` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_id` (`assessment_id`),
  KEY `idx_grades_student` (`student_id`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grades_ibfk_2` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `chk_grades_grade_value_range` CHECK (`grade_value` >= 0 and `grade_value` <= 20)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES
(1,2,1,18.78,'Bon travail'),
(2,3,1,10.96,'Peut faire mieux'),
(3,6,1,10.43,'Peut faire mieux'),
(4,8,1,19.56,'Bon travail'),
(5,14,1,19.16,'Bon travail'),
(6,2,2,11.77,'Peut faire mieux'),
(7,3,2,12.91,'Peut faire mieux'),
(8,6,2,12.04,'Peut faire mieux'),
(9,8,2,15.34,'Bon travail'),
(10,14,2,19.75,'Bon travail'),
(11,4,3,18.91,'Bon travail'),
(12,7,3,15.71,'Bon travail'),
(13,9,3,10.17,'Peut faire mieux'),
(14,10,3,14.99,'Bon travail'),
(15,13,3,9.73,'Peut faire mieux'),
(16,15,3,19.42,'Bon travail'),
(17,4,4,9.74,'Peut faire mieux'),
(18,7,4,8.35,'Peut faire mieux'),
(19,9,4,12.64,'Peut faire mieux'),
(20,10,4,15.21,'Bon travail'),
(21,13,4,16.21,'Bon travail'),
(22,15,4,16.23,'Bon travail'),
(23,1,5,11.1,'Peut faire mieux'),
(24,5,5,14.11,'Bon travail'),
(25,11,5,17.15,'Bon travail'),
(26,12,5,19.79,'Bon travail'),
(27,1,6,19.45,'Bon travail'),
(28,5,6,8.96,'Peut faire mieux'),
(29,11,6,8.6,'Peut faire mieux'),
(30,12,6,12,'Peut faire mieux');
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_messages_sender_id` (`sender_id`),
  KEY `idx_messages_receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES
(1,1,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(2,2,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(3,4,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(4,16,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(5,17,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(6,18,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(7,19,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(8,20,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(9,21,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(10,22,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(11,23,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(12,24,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(13,25,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(14,26,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(15,27,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(16,28,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(17,29,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(18,30,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(19,5,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(20,11,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(21,12,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(22,13,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(23,14,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(24,15,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(25,6,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(26,3,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(27,8,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(28,9,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14'),
(29,10,'Bienvenue','La nouvelle année scolaire a commencé.',0,'2026-04-30 17:51:14');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `parents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `parents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `parents_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `parents` WRITE;
/*!40000 ALTER TABLE `parents` DISABLE KEYS */;
INSERT INTO `parents` VALUES
(1,11),
(2,12),
(3,13),
(4,14),
(5,15);
/*!40000 ALTER TABLE `parents` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fee_id` int(11) DEFAULT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  `amount_paid` int(11) NOT NULL,
  `installment_number` int(11) DEFAULT 1,
  `payment_date` timestamp NULL DEFAULT current_timestamp(),
  `receipt_number` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  UNIQUE KEY `receipt_number` (`receipt_number`),
  KEY `idx_payments_fee` (`fee_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`fee_id`) REFERENCES `student_fees` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`transaction_id`) REFERENCES `user_transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `posts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_posts_user_id` (`user_id`),
  CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `posts` WRITE;
/*!40000 ALTER TABLE `posts` DISABLE KEYS */;
/*!40000 ALTER TABLE `posts` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `programs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `program_name` varchar(100) NOT NULL,
  `program_type` varchar(50) NOT NULL,
  `price_cash` int(11) DEFAULT 0,
  `price_installments` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `programs` WRITE;
/*!40000 ALTER TABLE `programs` DISABLE KEYS */;
INSERT INTO `programs` VALUES
(1,'Programme Annuel','Standard',45000,0);
/*!40000 ALTER TABLE `programs` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `resources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `resource_type` varchar(50) NOT NULL,
  `file_path_or_url` varchar(500) NOT NULL,
  `file_size_mb` double DEFAULT 0,
  `assignment_id` int(11) DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `resources_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `teacher_assignments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`name` in ('admin','receptionist','student','parent','accountant','teacher'))
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES
(5,'accountant'),
(1,'admin'),
(4,'parent'),
(2,'receptionist'),
(3,'student'),
(6,'teacher');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assignment_id` int(11) DEFAULT NULL,
  `day_of_week` enum('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') NOT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `teacher_assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES
(1,1,'Monday','13:00:00','15:00:00','Laboratoire A'),
(2,1,'Thursday','13:00:00','15:00:00','Salle 02'),
(3,2,'Tuesday','10:00:00','12:00:00','Laboratoire A'),
(4,2,'Sunday','08:00:00','10:00:00','Laboratoire A'),
(5,3,'Tuesday','08:00:00','10:00:00','Salle 03'),
(6,3,'Wednesday','10:00:00','12:00:00','Salle 01'),
(7,4,'Thursday','13:00:00','15:00:00','Salle 01'),
(8,4,'Wednesday','10:00:00','12:00:00','Salle 02'),
(9,5,'Tuesday','13:00:00','15:00:00','Salle 01'),
(10,5,'Sunday','08:00:00','10:00:00','Salle 01'),
(11,6,'Sunday','10:00:00','12:00:00','Salle 01'),
(12,6,'Thursday','10:00:00','12:00:00','Salle 03');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `student_enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `group_name` varchar(50) DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `program_id` (`program_id`),
  CONSTRAINT `student_enrollments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_enrollments_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `student_enrollments` WRITE;
/*!40000 ALTER TABLE `student_enrollments` DISABLE KEYS */;
/*!40000 ALTER TABLE `student_enrollments` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `student_fees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `student_fees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `program_id` int(11) DEFAULT NULL,
  `fee_type` varchar(50) NOT NULL,
  `amount_due` int(11) NOT NULL,
  `applied_discount` int(11) DEFAULT 0,
  `due_date` date DEFAULT NULL,
  `transaction_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `program_id` (`program_id`),
  KEY `transaction_id` (`transaction_id`),
  KEY `idx_student_fees_student` (`student_id`),
  CONSTRAINT `student_fees_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `student_fees_ibfk_2` FOREIGN KEY (`program_id`) REFERENCES `programs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `student_fees_ibfk_3` FOREIGN KEY (`transaction_id`) REFERENCES `user_transactions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `student_fees` WRITE;
/*!40000 ALTER TABLE `student_fees` DISABLE KEYS */;
INSERT INTO `student_fees` VALUES
(1,1,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(2,2,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(3,3,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(4,4,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(5,5,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(6,6,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(7,7,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(8,8,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(9,9,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(10,10,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(11,11,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(12,12,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(13,13,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(14,14,1,'Frais Scolaires',45000,0,'2026-05-30',NULL),
(15,15,1,'Frais Scolaires',45000,0,'2026-05-30',NULL);
/*!40000 ALTER TABLE `student_fees` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `blood_group` varchar(5) DEFAULT NULL,
  `medical_info` text DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `parent_id` (`parent_id`),
  KEY `class_id` (`class_id`),
  KEY `idx_students_user` (`user_id`),
  CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `students_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `parents` (`id`) ON DELETE SET NULL,
  CONSTRAINT `students_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES
(1,16,1,3,'2009-07-15','2026-04-30',NULL,NULL,'active'),
(2,17,4,1,'2009-02-15','2026-04-30',NULL,NULL,'active'),
(3,18,5,1,'2010-03-15','2026-04-30',NULL,NULL,'active'),
(4,19,4,2,'2009-09-15','2026-04-30',NULL,NULL,'active'),
(5,20,5,3,'2008-05-15','2026-04-30',NULL,NULL,'active'),
(6,21,1,1,'2010-03-15','2026-04-30',NULL,NULL,'active'),
(7,22,2,2,'2010-04-15','2026-04-30',NULL,NULL,'active'),
(8,23,2,1,'2009-07-15','2026-04-30',NULL,NULL,'active'),
(9,24,5,2,'2010-01-15','2026-04-30',NULL,NULL,'active'),
(10,25,1,2,'2008-06-15','2026-04-30',NULL,NULL,'active'),
(11,26,4,3,'2010-09-15','2026-04-30',NULL,NULL,'active'),
(12,27,1,3,'2010-06-15','2026-04-30',NULL,NULL,'active'),
(13,28,5,2,'2008-06-15','2026-04-30',NULL,NULL,'active'),
(14,29,5,1,'2010-02-15','2026-04-30',NULL,NULL,'active'),
(15,30,4,2,'2008-01-15','2026-04-30',NULL,NULL,'active');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES
(1,'Mathématiques',NULL),
(2,'Physique-Chimie',NULL),
(3,'Sciences Naturelles',NULL),
(4,'Langue Arabe',NULL),
(5,'Langue Française',NULL),
(6,'Anglais',NULL);
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `teacher_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teacher_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `subject_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `class_id` (`class_id`),
  KEY `idx_assignments_teacher` (`teacher_id`),
  CONSTRAINT `teacher_assignments_ibfk_1` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `teacher_assignments_ibfk_3` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `teacher_assignments` WRITE;
/*!40000 ALTER TABLE `teacher_assignments` DISABLE KEYS */;
INSERT INTO `teacher_assignments` VALUES
(1,2,1,1),
(2,2,2,1),
(3,2,6,2),
(4,1,6,2),
(5,3,3,3),
(6,1,1,3);
/*!40000 ALTER TABLE `teacher_assignments` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `specialty` varchar(100) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `idx_teacher_user` (`user_id`),
  CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES
(1,8,'Anglais','2023-09-01'),
(2,9,'Mathématiques','2023-09-01'),
(3,10,'Mathématiques','2023-09-01');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `user_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_user_id` int(11) NOT NULL,
  `to_user_id` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'completed',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `to_user_id` (`to_user_id`),
  KEY `idx_transactions_from` (`from_user_id`),
  CONSTRAINT `user_transactions_ibfk_1` FOREIGN KEY (`from_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_transactions_ibfk_2` FOREIGN KEY (`to_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `user_transactions` WRITE;
/*!40000 ALTER TABLE `user_transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_transactions` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) DEFAULT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,1,'admin','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','admin_test@gmail.com','Administrator',NULL,NULL,1,'2026-04-30 17:51:13'),
(2,2,'reception','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','reception@gmail.com','Front Desk Officer',NULL,NULL,1,'2026-04-30 17:51:13'),
(3,6,'teacher','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','teacher@gmail.com','Subject Teacher',NULL,NULL,1,'2026-04-30 17:51:13'),
(4,3,'student','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','student@gmail.com','School Student',NULL,NULL,1,'2026-04-30 17:51:13'),
(5,4,'parent','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','parent@gmail.com','Student Parent',NULL,NULL,1,'2026-04-30 17:51:13'),
(6,5,'accountant','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','accountant@gmail.com','Financial Accountant',NULL,NULL,1,'2026-04-30 17:51:13'),
(8,6,'prof1','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','prof1@school.local','Manel Bousbaa','055172299',NULL,1,'2026-04-30 17:51:14'),
(9,6,'prof2','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','prof2@school.local','Ilyes Mansouri','055896986',NULL,1,'2026-04-30 17:51:14'),
(10,6,'prof3','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','prof3@school.local','Rania Hamdi','055253083',NULL,1,'2026-04-30 17:51:14'),
(11,4,'parent1','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','parent1@school.local','Amine Bousbaa','055974434',NULL,1,'2026-04-30 17:51:14'),
(12,4,'parent2','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','parent2@school.local','Chaima Bousbaa','055649862',NULL,1,'2026-04-30 17:51:14'),
(13,4,'parent3','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','parent3@school.local','Chaima Bousbaa','055829446',NULL,1,'2026-04-30 17:51:14'),
(14,4,'parent4','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','parent4@school.local','Chaima Benali','055814806',NULL,1,'2026-04-30 17:51:14'),
(15,4,'parent5','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','parent5@school.local','Yassine Mansouri','055577894',NULL,1,'2026-04-30 17:51:14'),
(16,3,'eleve1','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve1@school.local','Aymen Benali','055314246',NULL,1,'2026-04-30 17:51:14'),
(17,3,'eleve2','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve2@school.local','Sarah Saidi','055186987',NULL,1,'2026-04-30 17:51:14'),
(18,3,'eleve3','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve3@school.local','Aymen Mansouri','055595590',NULL,1,'2026-04-30 17:51:14'),
(19,3,'eleve4','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve4@school.local','Mohamed Brahimi','055597799',NULL,1,'2026-04-30 17:51:14'),
(20,3,'eleve5','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve5@school.local','Amine Belkacem','055552000',NULL,1,'2026-04-30 17:51:14'),
(21,3,'eleve6','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve6@school.local','Amine Bousbaa','055182215',NULL,1,'2026-04-30 17:51:14'),
(22,3,'eleve7','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve7@school.local','Aymen Benali','055229437',NULL,1,'2026-04-30 17:51:14'),
(23,3,'eleve8','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve8@school.local','Amine Zerrouki','055437301',NULL,1,'2026-04-30 17:51:14'),
(24,3,'eleve9','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve9@school.local','Chaima Belkacem','055264105',NULL,1,'2026-04-30 17:51:14'),
(25,3,'eleve10','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve10@school.local','Imane Hamdi','055941217',NULL,1,'2026-04-30 17:51:14'),
(26,3,'eleve11','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve11@school.local','Ilyes Belkacem','055191860',NULL,1,'2026-04-30 17:51:14'),
(27,3,'eleve12','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve12@school.local','Fatima Zerrouki','055411265',NULL,1,'2026-04-30 17:51:14'),
(28,3,'eleve13','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve13@school.local','Imane Saidi','055957400',NULL,1,'2026-04-30 17:51:14'),
(29,3,'eleve14','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve14@school.local','Imane Brahimi','055357484',NULL,1,'2026-04-30 17:51:14'),
(30,3,'eleve15','11a4a60b518bf24989d481468076e5d5982884626aed9faeb35b8576fcd223e1','eleve15@school.local','Walid Touati','055289263',NULL,1,'2026-04-30 17:51:14');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

USE `SchoolDB`;
/*!50001 DROP VIEW IF EXISTS `StudentAttendanceSummaryView`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`school_app`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `StudentAttendanceSummaryView` AS select `s`.`id` AS `student_id`,`u`.`full_name` AS `student_name`,count(`a`.`id`) AS `total_sessions`,sum(`a`.`status` = 'present') AS `present_count`,sum(`a`.`status` = 'absent') AS `absent_count`,sum(`a`.`status` = 'absent' and `a`.`is_justified` = 1) AS `justified_absences`,round(sum(`a`.`status` = 'present') / count(`a`.`id`) * 100,1) AS `attendance_rate_pct` from ((`attendance` `a` join `students` `s` on(`s`.`id` = `a`.`student_id`)) join `users` `u` on(`u`.`id` = `s`.`user_id`)) group by `s`.`id`,`u`.`full_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `StudentFeesSummaryView`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`school_app`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `StudentFeesSummaryView` AS select `s`.`id` AS `student_id`,`u`.`full_name` AS `student_name`,`c`.`class_name` AS `class_name`,coalesce(sum(`sf`.`amount_due`),0) AS `total_fees_due`,coalesce(sum(`sf`.`applied_discount`),0) AS `total_discounts`,coalesce(sum(`p`.`amount_paid`),0) AS `total_paid`,coalesce(sum(`sf`.`amount_due`),0) - coalesce(sum(`sf`.`applied_discount`),0) - coalesce(sum(`p`.`amount_paid`),0) AS `balance_remaining` from ((((`students` `s` join `users` `u` on(`u`.`id` = `s`.`user_id`)) left join `classes` `c` on(`c`.`id` = `s`.`class_id`)) left join `student_fees` `sf` on(`sf`.`student_id` = `s`.`id`)) left join `payments` `p` on(`p`.`fee_id` = `sf`.`id`)) group by `s`.`id`,`u`.`full_name`,`c`.`class_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!50001 DROP VIEW IF EXISTS `StudentGradesAverageView`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`school_app`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `StudentGradesAverageView` AS select `s`.`id` AS `student_id`,`u`.`full_name` AS `student_name`,`sub`.`subject_name` AS `subject_name`,round(avg(`g`.`grade_value`),2) AS `average_grade`,count(`g`.`id`) AS `assessments_count` from (((((`grades` `g` join `students` `s` on(`s`.`id` = `g`.`student_id`)) join `users` `u` on(`u`.`id` = `s`.`user_id`)) join `assessments` `a` on(`a`.`id` = `g`.`assessment_id`)) join `teacher_assignments` `ta` on(`ta`.`id` = `a`.`assignment_id`)) join `subjects` `sub` on(`sub`.`id` = `ta`.`subject_id`)) group by `s`.`id`,`u`.`full_name`,`sub`.`subject_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

