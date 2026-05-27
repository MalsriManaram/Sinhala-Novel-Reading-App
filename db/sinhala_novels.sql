/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (aarch64)
--
-- Host: localhost    Database: sinhala_novels
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0+deb12u2

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

--
-- Current Database: `sinhala_novels`
--

/*!40000 DROP DATABASE IF EXISTS `sinhala_novels`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `sinhala_novels` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `sinhala_novels`;

--
-- Table structure for table `ad_unlocks`
--

DROP TABLE IF EXISTS `ad_unlocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ad_unlocks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `chapter_id` int(11) NOT NULL,
  `unlocked_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `chapter_id` (`chapter_id`),
  CONSTRAINT `ad_unlocks_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ad_unlocks_ibfk_2` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ad_unlocks`
--

LOCK TABLES `ad_unlocks` WRITE;
/*!40000 ALTER TABLE `ad_unlocks` DISABLE KEYS */;
INSERT INTO `ad_unlocks` VALUES
(1,9,2,'2026-05-27 11:17:19'),
(2,18,2,'2026-05-27 11:20:44'),
(3,28,2,'2026-05-27 11:25:05');
/*!40000 ALTER TABLE `ad_unlocks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chapters`
--

DROP TABLE IF EXISTS `chapters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `chapters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `novel_id` int(11) NOT NULL,
  `chapter_number` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` mediumtext NOT NULL,
  `is_premium` tinyint(1) NOT NULL,
  `published_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_chapters_novel_number` (`novel_id`,`chapter_number`),
  CONSTRAINT `chapters_ibfk_1` FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chapters`
--

LOCK TABLES `chapters` WRITE;
/*!40000 ALTER TABLE `chapters` DISABLE KEYS */;
INSERT INTO `chapters` VALUES
(1,1,1,'The First Echo','The ring hummed at 41 hertz, a frequency Anuki had learned to ignore in the way one ignores one\'s own pulse.\n\nBut tonight there was something underneath it — a softer, slower rhythm, as if the station were breathing in its sleep. She pressed her palm to the corridor wall and counted: three seconds in, four seconds out. Not mechanical. Not human, either.\n\nGeometry, her father had once said, is the conscience of the universe. It cannot lie, and it cannot forget.\n\nShe walked toward the silence, and the silence did not move away.',0,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(2,1,2,'Non-Euclidean Mercy','By the seventh corridor, Anuki understood she had walked further than the station was wide.\n\nThe lights ahead had begun to repeat — the same flicker pattern, every nineteen paces — and her watch insisted it was still 03:14. She unrolled the schematic on her sleeve and traced the path with a fingertip. The corridor she stood in did not exist.\n\nAnd then, very softly, she heard her own footsteps catch up from behind her.',1,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(3,1,3,'What the Topology Wants','There is a theorem, almost too cruel to be useful, that says any closed surface can be deformed without tearing into precisely one of three shapes.\n\nAnuki was beginning to suspect the station had chosen the third.',1,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(4,2,1,'පළමු හමුව','කොළඹ ගාලු මුවදොර අසල, සැඳෑ දහවල හිමි ව ආ සුළඟ අතර, ඇය ඔහු දුටුවාය.\n\nකාලය නවත්වා ඇතැයි ඇය සිතුවාය. නමුත් කාලය නවතින්නේ නැත — ඉතිරිවන්නේ අපිමයි.',0,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(5,2,2,'සිහින අතර','ඊළඟ දින දහයෙහි, ඇය නැවත නැවතත් ඔහු ගැන සිහි කළාය. නමුත් සිහින අතරින් මතු වූයේ වෙනත් මුහුණක්ය.',1,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(6,3,1,'The Whistler at the Bus Stand','Rohan never stole from monks, blind men, or anyone whistling the same song as his late mother. The man at the Pettah bus stand was breaking all three rules.',0,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(7,3,2,'Rosewood and Rain','The professor\'s office smelled of rosewood and rain, even though the windows had been sealed for three months.',1,'2026-05-27 10:58:50','2026-05-27 10:58:50');
/*!40000 ALTER TABLE `chapters` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `novels`
--

DROP TABLE IF EXISTS `novels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `novels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `author` varchar(160) NOT NULL,
  `synopsis` text DEFAULT NULL,
  `cover_url` varchar(512) DEFAULT NULL,
  `category` varchar(80) NOT NULL,
  `status` varchar(16) NOT NULL,
  `release_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_novels_category_status` (`category`,`status`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `novels`
--

LOCK TABLES `novels` WRITE;
/*!40000 ALTER TABLE `novels` DISABLE KEYS */;
INSERT INTO `novels` VALUES
(1,'The Geometry of Silence','Ruvinda Samaranayake','On the orbital ring of Helion-IV, a topologist hears footsteps in a corridor that no one else can. As the geometry of the station begins to disagree with itself, she must decide whether the silence is mathematics — or memory.','https://images.unsplash.com/photo-1489846986031-7cea03ab8fd0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBkYXJrJTIwY2luZW1hdGljJTIwcG9zdGVyfGVufDB8fHx8MTc3OTg3OTA2NXww&ixlib=rb-4.1.0&q=85','Hard Science Fiction','published',NULL,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(2,'හිමි කතාව','Sunethra Rajakaruna','කොළඹ අහසේ සඳ එළිය යටතේ, පැරණි පෙම්වතුන් දෙදෙනකු හමුවේ.','https://images.unsplash.com/photo-1622798203916-a91709f62d2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHw0fHxmYW50YXN5JTIwcm9tYW5jZSUyMGJvb2slMjBjb3ZlciUyMGFydHxlbnwwfHx8fDE3Nzk4NzkwNjV8MA&ixlib=rb-4.1.0&q=85','Romance','published',NULL,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(3,'Shadows of Pettah','Anuradha Perera','A pickpocket, a missing professor, and a city that has secrets older than its streets.','https://images.pexels.com/photos/28302225/pexels-photo-28302225.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940','Mystery','published',NULL,'2026-05-27 10:58:50','2026-05-27 10:58:50'),
(4,'The Cinnamon Coast Chronicles','Ishara Wijesinghe','An epic spanning four generations of a family bound to the sea — and to a debt the sea has never forgiven.','https://images.unsplash.com/photo-1771576741909-d0bf6f60fb05?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxmYW50YXN5JTIwcm9tYW5jZSUyMGJvb2slMjBjb3ZlciUyMGFydHxlbnwwfHx8fDE3Nzk4NzkwNjV8MA&ixlib=rb-4.1.0&q=85','Historical Fiction','upcoming','2026-06-10 10:58:50','2026-05-27 10:58:50','2026-05-27 10:58:50'),
(5,'Yaka Protocol','Dilshan Karunaratne','A cybersecurity thriller set in Colombo\'s near-future, where an AI exorcist is the last firewall between the city and an ancient signal.','https://images.unsplash.com/photo-1489846986031-7cea03ab8fd0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBkYXJrJTIwY2luZW1hdGljJTIwcG9zdGVyfGVufDB8fHx8MTc3OTg3OTA2NXww&ixlib=rb-4.1.0&q=85','Thriller','upcoming','2026-06-10 10:58:50','2026-05-27 10:58:50','2026-05-27 10:58:50');
/*!40000 ALTER TABLE `novels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `otps`
--

DROP TABLE IF EXISTS `otps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `otps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(32) NOT NULL,
  `code` varchar(8) NOT NULL,
  `purpose` varchar(32) NOT NULL,
  `consumed` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_otps_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `otps`
--

LOCK TABLES `otps` WRITE;
/*!40000 ALTER TABLE `otps` DISABLE KEYS */;
INSERT INTO `otps` VALUES
(1,'+94771234567','944272','login',0,'2026-05-27 11:13:03','2026-05-27 11:18:03'),
(2,'+94778726096','132602','login',1,'2026-05-27 11:17:15','2026-05-27 11:22:15'),
(3,'+94771866596','037568','subscribe',1,'2026-05-27 11:17:18','2026-05-27 11:22:18'),
(4,'+94774803100','147578','login',1,'2026-05-27 11:20:39','2026-05-27 11:25:39'),
(5,'+94776481353','904781','subscribe',1,'2026-05-27 11:20:43','2026-05-27 11:25:43'),
(6,'+94771968854','947255','login',1,'2026-05-27 11:25:01','2026-05-27 11:30:01'),
(7,'+94777186427','747960','subscribe',1,'2026-05-27 11:25:04','2026-05-27 11:30:04');
/*!40000 ALTER TABLE `otps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ratings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `novel_id` int(11) NOT NULL,
  `score` smallint(6) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_rating_user_novel` (`user_id`,`novel_id`),
  KEY `novel_id` (`novel_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ratings`
--

LOCK TABLES `ratings` WRITE;
/*!40000 ALTER TABLE `ratings` DISABLE KEYS */;
INSERT INTO `ratings` VALUES
(1,1,1,5,'2026-05-27 11:13:03','2026-05-27 11:13:03'),
(2,5,1,5,'2026-05-27 11:17:17','2026-05-27 11:17:17'),
(3,13,1,5,'2026-05-27 11:20:42','2026-05-27 11:20:42'),
(4,23,1,5,'2026-05-27 11:25:03','2026-05-27 11:25:03');
/*!40000 ALTER TABLE `ratings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reminders`
--

DROP TABLE IF EXISTS `reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reminders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `novel_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_reminder_user_novel` (`user_id`,`novel_id`),
  KEY `novel_id` (`novel_id`),
  CONSTRAINT `reminders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reminders_ibfk_2` FOREIGN KEY (`novel_id`) REFERENCES `novels` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reminders`
--

LOCK TABLES `reminders` WRITE;
/*!40000 ALTER TABLE `reminders` DISABLE KEYS */;
/*!40000 ALTER TABLE `reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `provider` varchar(32) NOT NULL,
  `plan` varchar(32) NOT NULL,
  `status` varchar(16) NOT NULL,
  `started_at` datetime NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  `cancelled_at` datetime DEFAULT NULL,
  `external_id` varchar(128) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
INSERT INTO `subscriptions` VALUES
(1,6,'revenuecat','monthly','cancelled','2026-05-27 11:17:18','2026-06-26 11:17:18','2026-05-27 11:17:18','rc_mock_1779880638'),
(2,7,'ideamart','weekly','active','2026-05-27 11:17:19','2026-06-03 11:17:19',NULL,NULL),
(3,8,'revenuecat','monthly','cancelled','2026-05-27 11:17:19','2026-06-26 11:17:19','2026-05-27 11:17:19','monthly_iap'),
(4,14,'revenuecat','monthly','active','2026-05-27 11:20:42','2026-06-26 11:20:42',NULL,'rc_mock_1779880842'),
(5,15,'revenuecat','monthly','cancelled','2026-05-27 11:20:42','2026-06-26 11:20:42','2026-05-27 11:20:43','rc_mock_1779880843'),
(6,16,'ideamart','weekly','active','2026-05-27 11:20:43','2026-06-03 11:20:43',NULL,NULL),
(7,17,'revenuecat','monthly','cancelled','2026-05-27 11:20:44','2026-06-26 11:20:44','2026-05-27 11:20:44','monthly_iap'),
(8,19,'revenuecat','monthly','active','2026-05-27 11:20:50','2026-06-26 11:20:50',NULL,'rc_mock_1779880851'),
(9,24,'revenuecat','monthly','active','2026-05-27 11:25:03','2026-06-26 11:25:03',NULL,'rc_mock_1779881103'),
(10,25,'revenuecat','monthly','cancelled','2026-05-27 11:25:04','2026-06-26 11:25:04','2026-05-27 11:25:04','rc_mock_1779881104'),
(11,26,'ideamart','weekly','active','2026-05-27 11:25:04','2026-06-03 11:25:04',NULL,NULL),
(12,27,'revenuecat','monthly','cancelled','2026-05-27 11:25:05','2026-06-26 11:25:05','2026-05-27 11:25:05','monthly_iap'),
(13,29,'revenuecat','monthly','active','2026-05-27 11:25:12','2026-06-26 11:25:12',NULL,'rc_mock_1779881113');
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(32) DEFAULT NULL,
  `name` varchar(120) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` varchar(16) NOT NULL,
  `premium_status` tinyint(1) NOT NULL,
  `country_code` varchar(8) DEFAULT NULL,
  `provider` varchar(32) NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `phone` (`phone`),
  KEY `ix_users_phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'ruvinda@sinhalanovels.app',NULL,'Ruvinda Samaranayake','$2b$12$FGeKfWK1Cp2UqJW7IJJvAOXv4h531DD7Lw/HHbs0CCqG4A0yJiGLq','admin',1,'LK','local','2026-05-27 10:58:50','2026-05-27 10:58:50'),
(2,NULL,'+94778726096','User 6096',NULL,'user',0,'US','phone','2026-05-27 11:17:15','2026-05-27 11:17:15'),
(3,'TEST_g_e52851@gmail.com',NULL,'G User',NULL,'user',0,'US','google','2026-05-27 11:17:15','2026-05-27 11:17:15'),
(4,'apple_tkn_cb0fde02bc71@social.local',NULL,'Apple User',NULL,'user',0,'US','apple','2026-05-27 11:17:16','2026-05-27 11:17:16'),
(5,'TEST_user_c47cf96a@example.com',NULL,'TEST User','$2b$12$dDSlQOJY0z0.y5d9O4BP5.7how/B42NrscdCIY094U1md83xeSDKy','user',0,'US','local','2026-05-27 11:17:16','2026-05-27 11:17:16'),
(6,'TEST_sub_7a8cf9@example.com',NULL,'Sub','$2b$12$wi7Kp7z4cF7ThBQMnOQTFu91gHqdyTb7fuqoQyFAVFwr8LQrSbGz6','user',0,'US','local','2026-05-27 11:17:18','2026-05-27 11:17:18'),
(7,'TEST_ideamart_262d50@example.com','+94771866596','L','$2b$12$FyNYbS0Q6YQ/2DlSRz1kLuH54I9Kff4nPn3fIEtOooYNhvENqzYgW','user',1,'US','local','2026-05-27 11:17:18','2026-05-27 11:17:19'),
(8,'TEST_wh_bc5e20@example.com',NULL,'WH','$2b$12$rufXmpLA7NFOIJ5eDMDkJub5as4.Ha8Q8Pyq3ct5HzcMyi17ZxVlC','user',0,'US','local','2026-05-27 11:17:19','2026-05-27 11:17:19'),
(9,'TEST_ads_ebb2d4@example.com',NULL,'A','$2b$12$dMqRxHS4cOVKu3SduIBIf..SU/5yBcY.V/Jgpr.RVN428QvcSBmpu','user',0,'US','local','2026-05-27 11:17:19','2026-05-27 11:17:19'),
(10,NULL,'+94774803100','User 3100',NULL,'user',0,'US','phone','2026-05-27 11:20:40','2026-05-27 11:20:40'),
(11,'TEST_g_aaab53@gmail.com',NULL,'G User',NULL,'user',0,'US','google','2026-05-27 11:20:40','2026-05-27 11:20:40'),
(12,'apple_tkn_e18ab40fe248@social.local',NULL,'Apple User',NULL,'user',0,'US','apple','2026-05-27 11:20:40','2026-05-27 11:20:40'),
(13,'TEST_user_cb5a5a33@example.com',NULL,'TEST User','$2b$12$Pso90ItUQIQbiygQVMWj8uCqCbdgRRQdlFP0.0d7U9ql/J9QcecQS','user',0,'US','local','2026-05-27 11:20:41','2026-05-27 11:20:41'),
(14,'TEST_premread_e8bf39@example.com',NULL,'P','$2b$12$u71ESXJ6X./TLV21BXIToOcIsmpPoktrlLPNi28hQEQX1sqpKipRK','user',1,'US','local','2026-05-27 11:20:42','2026-05-27 11:20:42'),
(15,'TEST_sub_d685f7@example.com',NULL,'Sub','$2b$12$uiO2B/npx8yGDms957bDGOCtiKSt1f.UFsHyK0PlIpdK3Fojk2Sp2','user',0,'US','local','2026-05-27 11:20:42','2026-05-27 11:20:43'),
(16,'TEST_ideamart_d27869@example.com','+94776481353','L','$2b$12$AAyJ34igo81chTBVwxbPS.kr6ncsaoItMviu1r.dQDI/2hjVLuWne','user',1,'US','local','2026-05-27 11:20:43','2026-05-27 11:20:43'),
(17,'TEST_wh_7f52b3@example.com',NULL,'WH','$2b$12$erNBGF946.eNR3o3daE8kO2D76eLvRNlA5ptC25edvogFles.IW6a','user',0,'US','local','2026-05-27 11:20:43','2026-05-27 11:20:44'),
(18,'TEST_ads_950fd1@example.com',NULL,'A','$2b$12$9CJ6Jm0lA5ZVAalcWtImHOQWRtmrxjiNnhckavxddUyEXHjmV7XCS','user',0,'US','local','2026-05-27 11:20:44','2026-05-27 11:20:44'),
(19,'TEST_ck_93ca7e@example.com',NULL,'K','$2b$12$quqO4swcGL2AVI.kGWzS4ektB1NJs.w5d8EegxlwNKA/UVM5F37Vy','user',1,'US','local','2026-05-27 11:20:50','2026-05-27 11:20:50'),
(20,NULL,'+94771968854','User 8854',NULL,'user',0,'US','phone','2026-05-27 11:25:01','2026-05-27 11:25:01'),
(21,'TEST_g_992a02@gmail.com',NULL,'G User',NULL,'user',0,'US','google','2026-05-27 11:25:01','2026-05-27 11:25:01'),
(22,'apple_tkn_855f941f6411@social.local',NULL,'Apple User',NULL,'user',0,'US','apple','2026-05-27 11:25:01','2026-05-27 11:25:01'),
(23,'TEST_user_c89dcd1b@example.com',NULL,'TEST User','$2b$12$eGZ11n2o6TCCyAfKbEXh5uzhrM.MQtqpjYrZ1PT.EFr2cvLSoEvkK','user',0,'US','local','2026-05-27 11:25:02','2026-05-27 11:25:02'),
(24,'TEST_premread_4bacdc@example.com',NULL,'P','$2b$12$OngO8B2SJBAK7JFs4BEjdOFg4cV6SGAU869sh1ZNbofpO/elueXJi','user',1,'US','local','2026-05-27 11:25:03','2026-05-27 11:25:03'),
(25,'TEST_sub_c4885d@example.com',NULL,'Sub','$2b$12$f.lCLFhyzeTHiPan7V8bKOdajGxAsC.UzbWgIswtKY/IMeFJyIpeK','user',0,'US','local','2026-05-27 11:25:04','2026-05-27 11:25:04'),
(26,'TEST_ideamart_71b774@example.com','+94777186427','L','$2b$12$vXtOYTJvADjWb1mJZUQg/.2ZVP6sDatOFph9Y15or9UOMdh7YPZrS','user',1,'US','local','2026-05-27 11:25:04','2026-05-27 11:25:04'),
(27,'TEST_wh_ee354f@example.com',NULL,'WH','$2b$12$50IWpl.wjebASTpNlAIrYuz1hajCRbOZjnWkNsrvkc/YqfjQu56Q2','user',0,'US','local','2026-05-27 11:25:05','2026-05-27 11:25:05'),
(28,'TEST_ads_3889cf@example.com',NULL,'A','$2b$12$mRuMblHzGED3KmQyaaZ8g.lE4/9yMfVaE6JLgjSs7rvyIMIuRi6l.','user',0,'US','local','2026-05-27 11:25:05','2026-05-27 11:25:05'),
(29,'TEST_ck_693836@example.com',NULL,'K','$2b$12$Jmfy6rJ3nVOcwWjaqr6gYu7mTDXVJesjHdUFAvGCJK9W0XnU3bbWW','user',1,'US','local','2026-05-27 11:25:12','2026-05-27 11:25:12');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'sinhala_novels'
--

--
-- Dumping routines for database 'sinhala_novels'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-27 11:46:08
