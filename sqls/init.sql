-- MySQL dump 10.13  Distrib 9.5.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: spot
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `spot`
--

/*!40000 DROP DATABASE IF EXISTS `spot`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `spot` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `spot`;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '管理员ID',
  `username` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password_hash` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1正常 0禁用',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES ('admin_001','admin','$2b$12$6JUd.7Nisbv3QJqyotz6NuehWWOHIhKJvcmDhTN6NXPDE2ExhcYNG','系统管理员',1,'2026-01-31 10:30:39','2026-01-31 10:30:39');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID',
  `title` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '标题',
  `image` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '图片URL',
  `link` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '跳转链接',
  `link_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '链接类型',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1正常 0禁用',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_sort_order` (`sort_order`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES ('banner_001','冬季体能特训营','/uploads/20260131/ai_e973e3859ef443729ff1dbdacdc94517.png','/pages/course/list?tag=体能','page',1,1,'2026-01-01 10:00:00','2026-01-31 13:58:53'),('banner_002','新用户专享39.8元','/uploads/20260131/ai_30ab3c8d1fec4ae9aec066101adcebc8.png','/pages/promotion/new-user','page',2,1,'2026-01-01 10:00:00','2026-01-31 13:59:55'),('banner_003','权益卡限时优惠','/uploads/20260131/ai_86ab69c5ebaa4ffaacc93aa2601e3e9d.png','/pages/member/cards','page',3,1,'2026-01-01 10:00:00','2026-01-31 14:00:40'),('banner_004','篮球课程火热报名中','/uploads/20260131/ai_04efa3efa1324619a113fc1b27482d07.png','/pages/course/list?tag=篮球','page',4,1,'2026-01-01 10:00:00','2026-01-31 22:05:18'),('banner_005','足球课程精彩回顾','/uploads/20260131/ai_1f3156d8e7b342c68162b1ef4c0c3242.png','/pages/article/detail?id=123','page',5,1,'2026-01-01 10:00:00','2026-01-31 22:12:48'),('fd98714c06f4446598a0d4945fad4676','首页轮播图1','/uploads/20260131/ai_87adf6fceb984f5485e48ea4f9707d21.png',NULL,NULL,0,1,'2026-01-31 13:55:29','2026-01-31 13:55:29');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `communities`
--

DROP TABLE IF EXISTS `communities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `communities` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '小区ID',
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '小区名称',
  `address` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '详细地址',
  `image` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '小区图片URL',
  `latitude` decimal(10,7) NOT NULL COMMENT '纬度',
  `longitude` decimal(10,7) NOT NULL COMMENT '经度',
  `province` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '省份',
  `city` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '城市',
  `district` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '区县',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1正常 0禁用',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_location` (`latitude`,`longitude`),
  KEY `idx_city` (`city`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小区表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `communities`
--

LOCK TABLES `communities` WRITE;
/*!40000 ALTER TABLE `communities` DISABLE KEYS */;
INSERT INTO `communities` VALUES ('community_001','碧海金阁','海口市美兰区海甸岛碧海大道18号','/uploads/20260131/ai_f4ea73117c204089a358ca176c35318e.png',20.0442200,110.1991030,'海南省','海口市','美兰区',1,'2025-11-01 09:00:00','2026-01-31 22:41:58'),('community_002','海悦东方','海口市龙华区滨海大道66号','/uploads/20260131/ai_2bbf03a484ae4bf795f43ee1bea4bba4.png',20.0364200,110.3326500,'海南省','海口市','龙华区',1,'2025-11-02 10:00:00','2026-01-31 22:44:33'),('community_003','阳光城','海口市琼山区府城中山路138号','/uploads/20260131/ai_e92b80e83afd404b96b066a39d7b7597.png',20.0003200,110.3334500,'海南省','海口市','琼山区',1,'2025-11-03 11:00:00','2026-01-31 22:47:09'),('community_004','万科森林度假公园','海口市美兰区演丰镇山尾头村','/uploads/20260131/ai_fffe72b9f6bc461bb133c05de85f3134.png',19.9935800,110.5012300,'海南省','海口市','美兰区',1,'2025-11-04 12:00:00','2026-01-31 22:47:35'),('community_005','绿地海长流','海口市秀英区长流镇长滨路','/uploads/20260131/ai_51657e4ab3fa4cf0932e37bf3429a341.png',20.0124500,110.2156700,'海南省','海口市','秀英区',1,'2025-11-05 13:00:00','2026-01-31 22:44:58');
/*!40000 ALTER TABLE `communities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_students`
--

DROP TABLE IF EXISTS `course_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_students` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID',
  `course_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '课程ID',
  `student_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学员ID',
  `order_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单ID',
  `price` decimal(10,2) NOT NULL COMMENT '单价',
  `is_new_user` tinyint(1) DEFAULT '0' COMMENT '是否新人价 1是 0否',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '状态',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_student` (`course_id`,`student_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_order_id` (`order_id`),
  CONSTRAINT `fk_course_students_course_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_course_students_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_course_students_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程学员关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_students`
--

LOCK TABLES `course_students` WRITE;
/*!40000 ALTER TABLE `course_students` DISABLE KEYS */;
INSERT INTO `course_students` VALUES ('50e4724f77424e54b3021c294ac54420','course_004','7eafd8731062498a90111e51417a5ad3','f13689b99b2649c09cccbf43459d4ad6',80.00,0,'pending','2026-01-31 23:17:50'),('972d310a449e4c2391c888d015531ccb','course_002','71f0a338abb94eb1a2c25ea0ce7350d0','e4bd89a536424f4587675f8506b967fc',100.00,0,'pending','2026-02-01 00:34:12'),('cs_001','course_001','student_001','order_006',39.80,0,'active','2026-01-28 10:10:00'),('cs_002','course_001','student_002','order_006',39.80,0,'active','2026-01-28 10:10:00'),('cs_003','course_001','student_003','order_007',39.80,0,'active','2026-01-29 11:15:00'),('cs_004','course_001','student_004','order_007',39.80,0,'active','2026-01-29 11:15:00'),('cs_005','course_002','student_010','order_008',100.00,0,'active','2026-01-30 09:20:00'),('cs_006','course_002','student_011','order_008',100.00,0,'active','2026-01-30 09:20:00'),('cs_007','course_006','student_005','order_004',42.50,0,'active','2026-01-25 09:15:00'),('cs_008','course_006','student_008','order_005',85.00,0,'active','2026-01-26 14:25:00'),('cs_009','course_008','student_001','order_001',50.00,0,'active','2026-01-15 10:05:00'),('cs_010','course_008','student_002','order_001',50.00,0,'active','2026-01-15 10:05:00'),('cs_011','course_008','student_006','order_003',50.00,0,'active','2026-01-14 15:20:00'),('cs_012','course_009','student_003','order_002',90.00,0,'active','2026-01-12 11:10:00'),('cs_013','course_011','student_001','order_012',60.00,0,'completed','2025-12-20 10:10:00'),('cs_014','course_011','student_003','order_013',60.00,0,'completed','2025-12-21 11:15:00'),('cs_015','course_012','student_008','order_015',150.00,0,'refunded','2026-01-10 10:10:00'),('ed0ac7ad57504c848fe5985f52f445cb','course_005','71f0a338abb94eb1a2c25ea0ce7350d0','9d13542a0e87433393e205a6c21194f3',70.00,0,'pending','2026-02-01 00:47:44'),('f7fd387b31934ceaa6b44fd6f40124c3','course_002','662b4fb9cf204854b242ad92f240c838','bcf2cce0215748b1a33c2be27fdf00a5',100.00,0,'pending','2026-02-01 00:29:42');
/*!40000 ALTER TABLE `course_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '课程ID',
  `community_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '小区ID',
  `teacher_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '教练ID',
  `name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '课程名称',
  `image` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '课程图片URL',
  `age_min` int NOT NULL COMMENT '最小年龄',
  `age_max` int NOT NULL COMMENT '最大年龄',
  `total_weeks` int NOT NULL COMMENT '总周数',
  `total_lessons` int NOT NULL COMMENT '总课时',
  `schedule_day` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '上课日(如:周六)',
  `schedule_start` time NOT NULL COMMENT '开始时间',
  `schedule_end` time NOT NULL COMMENT '结束时间',
  `location` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '上课地点详情',
  `price` decimal(10,2) NOT NULL COMMENT '原价',
  `member_price` decimal(10,2) NOT NULL COMMENT '会员价',
  `min_students` int NOT NULL COMMENT '最低开班人数',
  `max_students` int NOT NULL COMMENT '最大人数',
  `enrolled_count` int DEFAULT '0' COMMENT '已报名人数',
  `deadline` datetime NOT NULL COMMENT '报名截止时间',
  `start_date` date DEFAULT NULL COMMENT '开课日期',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'enrolling' COMMENT '状态 enrolling拼班中 pending待开课 started开班中 ended已结束 failed拼班失败 cancelled已取消',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_community_id` (`community_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deadline` (`deadline`),
  CONSTRAINT `fk_courses_community_id` FOREIGN KEY (`community_id`) REFERENCES `communities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_courses_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES ('course_001','community_001','teacher_001','体能+跳绳 (周六上午)','/uploads/20260131/ai_9dde5489fd7944b594c7fd3d8acb700b.png',7,12,10,20,'周六','09:00:00','10:30:00','碧海金阁小区运动场',80.00,39.80,4,10,4,'2026-02-10 23:59:59','2026-02-15','enrolling','2026-01-10 10:00:00','2026-01-31 22:22:07'),('course_002','community_002','teacher_002','少儿足球启蒙 (周日下午)','/uploads/20260131/ai_4c019b4c7dde4a6396fd3e97c7daad76.png',6,10,12,24,'周日','15:00:00','16:30:00','海悦东方足球场',100.00,50.00,6,12,2,'2026-02-12 23:59:59','2026-02-16','enrolling','2026-01-12 11:00:00','2026-01-31 20:46:14'),('course_003','community_001','teacher_003','篮球基础班 (周六下午)','/uploads/20260131/ai_602ffba396ee450b8a12873bd74218e0.png',8,12,10,20,'周六','15:00:00','16:30:00','碧海金阁篮球场',90.00,45.00,5,10,0,'2026-02-14 23:59:59','2026-02-20','enrolling','2026-01-15 09:00:00','2026-01-31 21:30:00'),('course_004','community_003','teacher_004','体能训练营 (周日上午)','/uploads/20260131/ai_aa6ba2c242a74e1594ca0396971328d0.png',7,11,8,16,'周日','09:00:00','10:30:00','阳光城活动中心',80.00,40.00,4,10,1,'2026-02-16 23:59:59','2026-02-22','enrolling','2026-01-18 10:30:00','2026-01-31 21:39:15'),('course_005','community_004','teacher_005','花样跳绳班 (周六上午)','/uploads/20260131/ai_f8193cf7df2b4780b8f80da75008e40d.png',6,10,10,20,'周六','10:00:00','11:30:00','万科森林度假公园广场',70.00,35.00,4,8,0,'2026-02-18 23:59:59','2026-02-25','enrolling','2026-01-20 11:00:00','2026-01-31 21:47:36'),('course_006','community_002','teacher_001','体能+篮球 (周日上午)','/uploads/20260131/ai_7fc04fdc771444a186f94e3fdce5ba03.png',8,12,10,20,'周日','09:00:00','10:30:00','海悦东方篮球场',85.00,42.50,5,10,2,'2026-01-25 23:59:59','2026-02-08','pending','2025-12-20 10:00:00','2026-01-31 21:48:50'),('course_007','community_005','teacher_006','综合体能课 (周六下午)','/uploads/20260131/ai_68eba807474d458cb7a966d95e903cfe.png',7,11,12,24,'周六','15:00:00','16:30:00','绿地海长流运动场',95.00,47.50,6,12,0,'2026-01-28 23:59:59','2026-02-10','pending','2025-12-25 11:00:00','2026-01-31 22:05:56'),('course_008','community_001','teacher_002','足球技巧提升班','/uploads/20260131/ai_c69932e0e8bc4ca5b130af85c06783fe.png',9,12,10,20,'周日','15:00:00','16:30:00','碧海金阁足球场',100.00,50.00,5,10,3,'2026-01-10 23:59:59','2026-01-18','started','2025-12-01 09:00:00','2026-01-31 22:12:43'),('course_009','community_003','teacher_003','篮球进阶班','/uploads/20260131/ai_bb15e17b076248049422fa19ed85359f.png',10,12,8,16,'周六','09:00:00','10:30:00','阳光城篮球馆',90.00,45.00,5,8,1,'2026-01-05 23:59:59','2026-01-12','started','2025-11-25 10:00:00','2026-01-31 21:57:43'),('course_010','community_002','teacher_004','跑步+体能训练','/uploads/20260131/ai_c553956462384e7893d200fc2266b3d0.png',7,11,10,20,'周日','08:00:00','09:30:00','海悦东方田径场',75.00,37.50,4,10,0,'2026-01-08 23:59:59','2026-01-15','started','2025-12-05 11:00:00','2026-01-31 21:50:56'),('course_011','community_004','teacher_005','寒假跳绳特训营','/uploads/20260131/ai_f4eac8fa2c4b4150a9a0c446ce239c05.png',7,12,4,12,'周一,周三,周五','09:00:00','11:00:00','万科森林度假公园',120.00,60.00,5,10,2,'2025-12-20 23:59:59','2025-12-25','ended','2025-11-20 09:00:00','2026-01-31 21:55:16'),('course_012','community_005','teacher_006','网球入门班','/uploads/20260131/ai_5603d8df1f464bbe82a7dddf962074d5.png',8,12,10,20,'周六','10:00:00','11:30:00','绿地海长流网球场',150.00,75.00,6,10,1,'2026-01-20 23:59:59','2026-01-31','failed','2025-12-15 10:00:00','2026-01-31 21:50:21');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member_cards`
--

DROP TABLE IF EXISTS `member_cards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member_cards` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '卡ID',
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '卡名称',
  `duration` int NOT NULL COMMENT '有效天数',
  `price` decimal(10,2) NOT NULL COMMENT '售价',
  `original_price` decimal(10,2) NOT NULL COMMENT '原价',
  `benefits` json DEFAULT NULL COMMENT '权益列表',
  `is_recommended` tinyint(1) DEFAULT '0' COMMENT '是否推荐 1是 0否',
  `sort_order` int DEFAULT '0' COMMENT '排序',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1正常 0禁用',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权益卡表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member_cards`
--

LOCK TABLES `member_cards` WRITE;
/*!40000 ALTER TABLE `member_cards` DISABLE KEYS */;
INSERT INTO `member_cards` VALUES ('c67801ecf474422cbb29e3625954ba0c','儿童权益卡',12,345.00,567.00,'{\"items\": [\"sfsf\"]}',0,0,1,'2026-01-31 23:46:42','2026-01-31 23:46:42'),('card_001','月度权益卡',30,29.90,99.00,'[\"课程享受会员价\", \"赠送100健康豆\", \"专属客服\"]',0,4,1,'2025-11-01 09:00:00','2025-11-01 09:00:00'),('card_002','季度权益卡',90,79.90,297.00,'[\"课程享受会员价\", \"赠送350健康豆\", \"专属客服\", \"优先报名新课程\"]',1,2,1,'2025-11-01 09:00:00','2025-11-01 09:00:00'),('card_003','半年权益卡',180,139.90,594.00,'[\"课程享受会员价\", \"赠送800健康豆\", \"专属客服\", \"优先报名新课程\", \"免费体验新课程1次\"]',1,1,1,'2025-11-01 09:00:00','2025-11-01 09:00:00'),('card_004','年度权益卡',365,259.90,1188.00,'[\"课程享受会员价\", \"赠送2000健康豆\", \"专属客服\", \"优先报名新课程\", \"免费体验新课程3次\", \"生日专属礼品\"]',0,3,1,'2025-11-01 09:00:00','2025-11-01 09:00:00'),('eb3bddfd78a7406ba6e711fc6cb83b61','儿童权益卡',12,234.00,673.00,'{\"items\": [\"sfsf\"]}',0,0,1,'2026-01-31 23:43:55','2026-01-31 23:43:55');
/*!40000 ALTER TABLE `member_cards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单ID',
  `order_no` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单号',
  `user_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `course_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '课程ID',
  `total_amount` decimal(10,2) NOT NULL COMMENT '订单总额',
  `discount_amount` decimal(10,2) DEFAULT '0.00' COMMENT '优惠金额',
  `pay_amount` decimal(10,2) NOT NULL COMMENT '实付金额',
  `coupon_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '优惠券ID',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单状态 pending待支付 paid已支付 cancelled已取消 refunding退款中 refunded已退款 completed已完成',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `expire_at` datetime NOT NULL COMMENT '过期时间',
  `refund_time` datetime DEFAULT NULL COMMENT '退款时间',
  `refund_amount` decimal(10,2) DEFAULT NULL COMMENT '退款金额',
  `remark` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_course_id` (`course_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_orders_course_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES ('9d13542a0e87433393e205a6c21194f3','ORD2026020100474335A4D8D8','e2fc4ed179f843f7b63ba447fa4e41fb','course_005',70.00,0.00,70.00,NULL,'pending',NULL,'2026-02-01 01:17:44',NULL,NULL,NULL,'2026-02-01 00:47:44','2026-02-01 00:47:44'),('bcf2cce0215748b1a33c2be27fdf00a5','ORD2026020100294204928294','416b3051595240428fbd257668d2f4a3','course_002',100.00,0.00,100.00,NULL,'pending',NULL,'2026-02-01 00:59:42',NULL,NULL,NULL,'2026-02-01 00:29:42','2026-02-01 00:29:42'),('e4bd89a536424f4587675f8506b967fc','ORD20260201003412F14A8343','e2fc4ed179f843f7b63ba447fa4e41fb','course_002',100.00,0.00,100.00,NULL,'pending',NULL,'2026-02-01 01:04:12',NULL,NULL,NULL,'2026-02-01 00:34:12','2026-02-01 00:34:12'),('f13689b99b2649c09cccbf43459d4ad6','ORD202601312317497A073012','ad8b765c0a5d4ccbae2b41cc52f5e435','course_004',80.00,0.00,80.00,NULL,'pending',NULL,'2026-01-31 23:47:50',NULL,NULL,NULL,'2026-01-31 23:17:50','2026-01-31 23:17:50'),('order_001','ORD202601150001','user_001','course_008',100.00,50.00,50.00,NULL,'paid','2026-01-15 10:05:00','2026-01-15 10:35:00',NULL,NULL,'2名学员报名','2026-01-15 10:00:00','2026-01-15 10:05:00'),('order_002','ORD202601120001','user_002','course_009',90.00,0.00,90.00,NULL,'paid','2026-01-12 11:10:00','2026-01-12 11:40:00',NULL,NULL,'1名学员报名','2026-01-12 11:05:00','2026-01-12 11:10:00'),('order_003','ORD202601140001','user_003','course_008',100.00,50.00,50.00,NULL,'paid','2026-01-14 15:20:00','2026-01-14 15:50:00',NULL,NULL,'1名学员报名','2026-01-14 15:15:00','2026-01-14 15:20:00'),('order_004','ORD202601250001','user_001','course_006',85.00,42.50,42.50,NULL,'paid','2026-01-25 09:15:00','2026-01-25 09:45:00',NULL,NULL,'1名学员报名','2026-01-25 09:10:00','2026-01-25 09:15:00'),('order_005','ORD202601260001','user_004','course_006',85.00,0.00,85.00,NULL,'paid','2026-01-26 14:25:00','2026-01-26 14:55:00',NULL,NULL,'1名学员报名','2026-01-26 14:20:00','2026-01-26 14:25:00'),('order_006','ORD202601280001','user_001','course_001',160.00,80.40,79.60,NULL,'paid','2026-01-28 10:10:00','2026-01-28 10:40:00',NULL,NULL,'2名学员报名','2026-01-28 10:05:00','2026-01-28 10:10:00'),('order_007','ORD202601290001','user_002','course_001',160.00,80.40,79.60,NULL,'paid','2026-01-29 11:15:00','2026-01-29 11:45:00',NULL,NULL,'2名学员报名','2026-01-29 11:10:00','2026-01-29 11:15:00'),('order_008','ORD202601300001','user_005','course_002',200.00,0.00,200.00,NULL,'paid','2026-01-30 09:20:00','2026-01-30 09:50:00',NULL,NULL,'2名学员报名','2026-01-30 09:15:00','2026-01-30 09:20:00'),('order_009','ORD202601310001','user_004','course_003',90.00,0.00,90.00,NULL,'pending',NULL,'2026-01-31 16:30:00',NULL,NULL,'1名学员报名','2026-01-31 16:00:00','2026-01-31 16:00:00'),('order_010','ORD202601310002','user_006','course_002',100.00,0.00,100.00,NULL,'pending',NULL,'2026-01-31 17:15:00',NULL,NULL,'1名学员报名','2026-01-31 16:45:00','2026-01-31 16:45:00'),('order_011','ORD202601270001','user_005','course_003',90.00,0.00,90.00,NULL,'cancelled',NULL,'2026-01-27 15:30:00',NULL,NULL,'用户取消','2026-01-27 15:00:00','2026-01-27 15:25:00'),('order_012','ORD202512200001','user_001','course_011',120.00,60.00,60.00,NULL,'completed','2025-12-20 10:10:00','2025-12-20 10:40:00',NULL,NULL,'1名学员报名','2025-12-20 10:05:00','2026-01-10 12:00:00'),('order_013','ORD202512210001','user_002','course_011',120.00,60.00,60.00,NULL,'completed','2025-12-21 11:15:00','2025-12-21 11:45:00',NULL,NULL,'1名学员报名','2025-12-21 11:10:00','2026-01-10 12:00:00'),('order_014','ORD202601160001','user_003','course_010',75.00,37.50,37.50,NULL,'refunding','2026-01-16 09:20:00','2026-01-16 09:50:00',NULL,NULL,'用户申请退款','2026-01-16 09:15:00','2026-01-30 14:30:00'),('order_015','ORD202601100001','user_004','course_012',150.00,0.00,150.00,NULL,'refunded','2026-01-10 10:10:00','2026-01-10 10:40:00','2026-01-22 15:30:00',150.00,'拼班失败退款','2026-01-10 10:05:00','2026-01-22 15:30:00');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '支付ID',
  `order_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单ID',
  `transaction_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信支付交易号',
  `amount` decimal(10,2) NOT NULL COMMENT '支付金额',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '状态 pending待支付 success支付成功 failed支付失败 refunded已退款',
  `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
  `refund_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '退款单号',
  `refund_amount` decimal(10,2) DEFAULT NULL COMMENT '退款金额',
  `refund_time` datetime DEFAULT NULL COMMENT '退款时间',
  `raw_data` json DEFAULT NULL COMMENT '原始数据',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_transaction_id` (`transaction_id`),
  CONSTRAINT `fk_payments_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('465bbe106fe546548ec5f9a11b99c214','bcf2cce0215748b1a33c2be27fdf00a5',NULL,100.00,'pending',NULL,NULL,NULL,NULL,NULL,'2026-02-01 00:30:03','2026-02-01 00:30:03'),('529c1445246d4a86a8e6e88e8342cbaf','f13689b99b2649c09cccbf43459d4ad6',NULL,80.00,'pending',NULL,NULL,NULL,NULL,NULL,'2026-01-31 23:19:39','2026-01-31 23:19:39'),('7650f631bdad4ef9b99bbd3e4b680ab0','bcf2cce0215748b1a33c2be27fdf00a5',NULL,100.00,'pending',NULL,NULL,NULL,NULL,NULL,'2026-02-01 00:30:27','2026-02-01 00:30:27'),('c6cebe4ee8aa4ba3bbc299dc4164fb45','bcf2cce0215748b1a33c2be27fdf00a5',NULL,100.00,'pending',NULL,NULL,NULL,NULL,NULL,'2026-02-01 00:30:33','2026-02-01 00:30:33'),('d5fb5987169749b8a5a4d2025a276ac6','bcf2cce0215748b1a33c2be27fdf00a5',NULL,100.00,'pending',NULL,NULL,NULL,NULL,NULL,'2026-02-01 00:29:47','2026-02-01 00:29:47'),('fa07bb4da15b4a13aef9e9c398a1448a','e4bd89a536424f4587675f8506b967fc',NULL,100.00,'pending',NULL,NULL,NULL,NULL,NULL,'2026-02-01 00:34:15','2026-02-01 00:34:15'),('payment_001','order_001','wx_txn_20260115100500001',50.00,'success','2026-01-15 10:05:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_001\", \"channel\": \"wechat\"}','2026-01-15 10:05:00','2026-01-15 10:05:00'),('payment_002','order_002','wx_txn_20260112111000001',90.00,'success','2026-01-12 11:10:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_002\", \"channel\": \"wechat\"}','2026-01-12 11:10:00','2026-01-12 11:10:00'),('payment_003','order_003','wx_txn_20260114152000001',50.00,'success','2026-01-14 15:20:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_003\", \"channel\": \"wechat\"}','2026-01-14 15:20:00','2026-01-14 15:20:00'),('payment_004','order_004','wx_txn_20260125091500001',42.50,'success','2026-01-25 09:15:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_001\", \"channel\": \"wechat\"}','2026-01-25 09:15:00','2026-01-25 09:15:00'),('payment_005','order_005','wx_txn_20260126142500001',85.00,'success','2026-01-26 14:25:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_004\", \"channel\": \"wechat\"}','2026-01-26 14:25:00','2026-01-26 14:25:00'),('payment_006','order_006','wx_txn_20260128101000001',79.60,'success','2026-01-28 10:10:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_001\", \"channel\": \"wechat\"}','2026-01-28 10:10:00','2026-01-28 10:10:00'),('payment_007','order_007','wx_txn_20260129111500001',79.60,'success','2026-01-29 11:15:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_002\", \"channel\": \"wechat\"}','2026-01-29 11:15:00','2026-01-29 11:15:00'),('payment_008','order_008','wx_txn_20260130092000001',200.00,'success','2026-01-30 09:20:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_005\", \"channel\": \"wechat\"}','2026-01-30 09:20:00','2026-01-30 09:20:00'),('payment_009','order_012','wx_txn_20251220101000001',60.00,'success','2025-12-20 10:10:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_001\", \"channel\": \"wechat\"}','2025-12-20 10:10:00','2025-12-20 10:10:00'),('payment_010','order_013','wx_txn_20251221111500001',60.00,'success','2025-12-21 11:15:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_002\", \"channel\": \"wechat\"}','2025-12-21 11:15:00','2025-12-21 11:15:00'),('payment_011','order_014','wx_txn_20260116092000001',37.50,'success','2026-01-16 09:20:00',NULL,NULL,NULL,'{\"openid\": \"wx_openid_003\", \"channel\": \"wechat\"}','2026-01-16 09:20:00','2026-01-16 09:20:00'),('payment_012','order_015','wx_txn_20260110101000001',150.00,'refunded','2026-01-10 10:10:00','wx_refund_20260122153000001',150.00,'2026-01-22 15:30:00','{\"openid\": \"wx_openid_004\", \"channel\": \"wechat\"}','2026-01-10 10:10:00','2026-01-22 15:30:00');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `students` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学员ID',
  `user_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `id_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '证件类型',
  `id_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '证件姓名',
  `id_number` varchar(256) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '证件号码(加密)',
  `id_number_hash` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '证件号码哈希',
  `photo` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '照片URL',
  `birthday` date NOT NULL COMMENT '出生日期',
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '性别',
  `member_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT 'normal' COMMENT '会员类型',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1正常 0禁用',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_id_number_hash` (`id_number_hash`),
  CONSTRAINT `fk_students_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学员表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `students`
--

LOCK TABLES `students` WRITE;
/*!40000 ALTER TABLE `students` DISABLE KEYS */;
INSERT INTO `students` VALUES ('662b4fb9cf204854b242ad92f240c838','416b3051595240428fbd257668d2f4a3','身份证','陈乐华','gAAAAABpfi3vE6Qe6i_u_TySdIB-Lza3GIxvGSdu7cxZFUhUGgbfi2yN0Ebirr9lSSK2TeKSYh1kBNWBK4v519xNLe5DddAL6LFSbG1WXVPdLZ8LSBD_k5E=','b910ef958970b74134f3f1e861dcb71ef8c86059185730039d4e033271dc9d5b','','1988-11-25','男','normal',1,'2026-02-01 00:29:36','2026-02-01 00:29:36'),('71f0a338abb94eb1a2c25ea0ce7350d0','e2fc4ed179f843f7b63ba447fa4e41fb','身份证','陈乐华','gAAAAABpfi77DD5zZr7Dznv7PkikGBS3tADscCeU3YX5ikS9iaZ4WBtas67GDNvUdAP84H3rjucuwHqHOA41fY8vZZ6oyBUF8_LpJySKl4bH-yu-eyYg-tc=','b910ef958970b74134f3f1e861dcb71ef8c86059185730039d4e033271dc9d5b','','1988-11-25','男','normal',1,'2026-02-01 00:34:03','2026-02-01 00:34:03'),('7eafd8731062498a90111e51417a5ad3','ad8b765c0a5d4ccbae2b41cc52f5e435','身份证','陈乐华','gAAAAABpfg2LbUZhOOD8DNCG4mu-u4Cqrm-AY-o11xEINSeu0Wc99Vjp23m_98HNiUoZC5HVamJTZWgsnq8AMcPA0mzpaXZ9ckx0D62dbJIenlzauml7vLQ=','b910ef958970b74134f3f1e861dcb71ef8c86059185730039d4e033271dc9d5b','http://localhost:8000/uploads/20260131/e566a39794bf49109ea0c56a680545fa.jpeg','1988-11-25','男','normal',1,'2026-01-31 22:11:23','2026-01-31 22:11:23'),('de00e8c411c1439d8069a94d4cbb7a87','ad8b765c0a5d4ccbae2b41cc52f5e435','身份证','孙园园','gAAAAABpfhRUNlHagQUZpQXDxPFJBO6K3ls_lijSYlzfTn-cXMOeqx-DnpSuXNpc0IpVDEF0WGD6kbNU_K1KJ-x7aSDCmn85nzRkrQsJ4iDoeoMXI1k59L0=','abede8e27c3ce1fd4887bc36ee4ab38c5d991217d12a2bae3f48dbb16c1c3943','http://localhost:8000/uploads/20260131/37790306bfdc4d86af6d4c30cee367fa.jpeg','1989-06-20','女','normal',1,'2026-01-31 22:40:21','2026-01-31 22:40:21'),('student_001','user_001','身份证','张小明','AES_ENCRYPTED_460001200901011234','4b8350a22b9788c32d151e6065409a689476ddad983b363d02f4261272766fee','https://img.example.com/student1.jpg','2009-01-01','男','normal',1,'2025-12-01 10:30:00','2025-12-01 10:30:00'),('student_002','user_001','身份证','张小红','AES_ENCRYPTED_460001201201011234','8ceb0159d5ed3aa0cafd0efcbc58de46e61da3dd6e0343b4e2682a884fd1dd50','https://img.example.com/student2.jpg','2012-01-01','女','normal',1,'2025-12-01 10:35:00','2025-12-01 10:35:00'),('student_003','user_002','身份证','李阳阳','AES_ENCRYPTED_460001201001015678','4704ef08eddae8a55f23e9e40a632e2ea773a7ef36bf71d8100320082e518266','https://img.example.com/student3.jpg','2010-01-01','男','normal',1,'2025-12-05 11:40:00','2025-12-05 11:40:00'),('student_004','user_002','身份证','李晴晴','AES_ENCRYPTED_460001201301015678','459b35b5101418b697dd9896dcc7537903816b89be4b89fefd6dcae7386aef87','https://img.example.com/student4.jpg','2013-01-01','女','normal',1,'2025-12-05 11:45:00','2025-12-05 11:45:00'),('student_005','user_003','身份证','王浩然','AES_ENCRYPTED_460001200801019999','07be64aeb6a3a758759fd9a17156a0c0f8268d9243932caaed8c5b3fd5a39f79','https://img.example.com/student5.jpg','2008-01-01','男','normal',1,'2025-12-10 16:00:00','2025-12-10 16:00:00'),('student_006','user_003','身份证','王诗涵','AES_ENCRYPTED_460001201101019999','d7e6c558d32e748e5c05521486650590e8c071ef0a2f5ea54f2cde267b4239da','https://img.example.com/student6.jpg','2011-01-01','女','normal',1,'2025-12-10 16:05:00','2025-12-10 16:05:00'),('student_007','user_003','身份证','王子轩','AES_ENCRYPTED_460001201401019999','4dd90b0ee6a20c90f28863c9236a53e7dfadc7c2c7ae2722013946a75159b3b8','https://img.example.com/student7.jpg','2014-01-01','男','normal',1,'2025-12-10 16:10:00','2025-12-10 16:10:00'),('student_008','user_004','身份证','陈思琪','AES_ENCRYPTED_460001200901012345','bdc025adce14c0fce91c00a58f36dc57b4d24a94e75c033e6ee9c14f49bb3ae3','https://img.example.com/student8.jpg','2009-01-01','女','normal',1,'2025-12-15 09:30:00','2025-12-15 09:30:00'),('student_009','user_004','身份证','陈俊豪','AES_ENCRYPTED_460001201201012345','eb9cf74ba22d0338e20acb50d0568d1655c7d7be0454f357e3b36fef766054c0','https://img.example.com/student9.jpg','2012-01-01','男','normal',1,'2025-12-15 09:35:00','2025-12-15 09:35:00'),('student_010','user_005','身份证','刘雨欣','AES_ENCRYPTED_460001201001016789','c9e63fe79c72808659fc4238325d65a4d5db629f0fd5201dbb2e8fb52377fa25','https://img.example.com/student10.jpg','2010-01-01','女','normal',1,'2025-12-20 14:30:00','2025-12-20 14:30:00'),('student_011','user_005','身份证','刘天宇','AES_ENCRYPTED_460001201301016789','de41bc457c746faeac62cf7de32991c25ad486cb070ddd1e2f5368a866b8c0e1','https://img.example.com/student11.jpg','2013-01-01','男','normal',1,'2025-12-20 14:35:00','2025-12-20 14:35:00'),('student_012','user_006','身份证','赵梓涵','AES_ENCRYPTED_460001200801013456','726263703e5ed73b477c90f5e5f283d2fd0ca48bce642982ffe36e2927bfc1c7','https://img.example.com/student12.jpg','2008-01-01','女','normal',1,'2026-01-05 16:40:00','2026-01-05 16:40:00'),('student_013','user_006','身份证','赵宇轩','AES_ENCRYPTED_460001201101013456','3de12527418efaa20355d3ea7e65e83ba9579d6a64205b1213ac257f89831ab7','https://img.example.com/student13.jpg','2011-01-01','男','normal',1,'2026-01-05 16:45:00','2026-01-05 16:45:00'),('student_014','user_007','身份证','孙悦悦','AES_ENCRYPTED_460001201201017890','87573b8cdca7dada8ae94debc3c657ef58d1ef62b20b5b5f81283f461d3e3b09',NULL,'2012-01-01','女','normal',1,'2026-01-28 10:30:00','2026-01-28 10:30:00'),('student_015','user_008','身份证','周博文','AES_ENCRYPTED_460001200901018901','dc5f86c429a509a14ef0fc56fc7fb442afd69a747f66d272fb089d9498c0ec34',NULL,'2009-01-01','男','normal',1,'2026-01-29 11:30:00','2026-01-29 11:30:00');
/*!40000 ALTER TABLE `students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teachers`
--

DROP TABLE IF EXISTS `teachers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teachers` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '教练ID',
  `name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '姓名',
  `avatar` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像URL',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `intro` text COLLATE utf8mb4_unicode_ci COMMENT '简介',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1正常 0禁用',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教练表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teachers`
--

LOCK TABLES `teachers` WRITE;
/*!40000 ALTER TABLE `teachers` DISABLE KEYS */;
INSERT INTO `teachers` VALUES ('teacher_001','小黑老师','https://img.example.com/teacher1.jpg','13900139001','国家一级体能教练，10年青少年体能训练经验，擅长体能训练、跳绳、篮球。曾培养多名省级青少年运动员。',1,'2025-11-01 09:00:00','2025-11-01 09:00:00'),('teacher_002','李教练','https://img.example.com/teacher2.jpg','13900139002','国家二级足球教练，8年青少年足球教学经验，持有中国足协C级教练证书。注重培养孩子的团队协作能力。',1,'2025-11-02 10:00:00','2025-11-02 10:00:00'),('teacher_003','王老师','https://img.example.com/teacher3.jpg','13900139003','国家级篮球裁判员，12年篮球教学经验，曾担任省青少年篮球队助教。擅长篮球基本功训练和战术指导。',1,'2025-11-03 11:00:00','2025-11-03 11:00:00'),('teacher_004','张教练','https://img.example.com/teacher4.jpg','13900139004','国家一级田径教练，专注于青少年跑步和体能训练。持有儿童体适能教练证书，教学风格活泼有趣。',1,'2025-11-04 12:00:00','2025-11-04 12:00:00'),('teacher_005','刘老师','https://img.example.com/teacher5.jpg','13900139005','国家级跳绳教练，6年跳绳教学经验，多次带队参加全国跳绳比赛并获奖。擅长花样跳绳和速度跳绳训练。',1,'2025-11-05 13:00:00','2025-11-05 13:00:00'),('teacher_006','陈教练','https://img.example.com/teacher6.jpg','13900139006','综合体能教练，持有国际儿童体适能认证。擅长设计趣味性强的体能游戏，让孩子在玩耍中提升体能素质。',1,'2025-11-06 14:00:00','2025-11-06 14:00:00');
/*!40000 ALTER TABLE `teachers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_members`
--

DROP TABLE IF EXISTS `user_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_members` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ID',
  `user_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `card_id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权益卡ID',
  `order_id` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '购买订单ID',
  `start_at` datetime NOT NULL COMMENT '开始时间',
  `expire_at` datetime NOT NULL COMMENT '过期时间',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1正常 0已过期',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expire_at` (`expire_at`),
  KEY `fk_user_members_card_id` (`card_id`),
  CONSTRAINT `fk_user_members_card_id` FOREIGN KEY (`card_id`) REFERENCES `member_cards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_members_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会员记录表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_members`
--

LOCK TABLES `user_members` WRITE;
/*!40000 ALTER TABLE `user_members` DISABLE KEYS */;
INSERT INTO `user_members` VALUES ('member_001','user_001','card_003',NULL,'2026-01-01 00:00:00','2026-06-30 23:59:59',1,'2026-01-01 10:00:00'),('member_002','user_002','card_002',NULL,'2026-01-01 00:00:00','2026-03-31 23:59:59',1,'2026-01-01 11:00:00'),('member_003','user_003','card_001',NULL,'2026-01-30 00:00:00','2026-02-28 23:59:59',1,'2026-01-30 09:00:00');
/*!40000 ALTER TABLE `user_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户ID',
  `openid` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '微信OpenID',
  `unionid` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '微信UnionID',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `nickname` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像URL',
  `health_beans` int DEFAULT '0' COMMENT '健康豆',
  `is_member` tinyint(1) DEFAULT '0' COMMENT '是否会员 1是 0否',
  `member_expire_at` datetime DEFAULT NULL COMMENT '会员过期时间',
  `status` tinyint(1) DEFAULT '1' COMMENT '状态 1正常 0禁用',
  `created_at` datetime NOT NULL COMMENT '创建时间',
  `updated_at` datetime NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`),
  UNIQUE KEY `unionid` (`unionid`),
  UNIQUE KEY `phone` (`phone`),
  KEY `idx_openid` (`openid`),
  KEY `idx_phone` (`phone`),
  KEY `idx_unionid` (`unionid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('184a240da0be4d7e87af92425b1e04f7','mock_openid_cb49f9e9e290e0d8',NULL,'13845332461',NULL,NULL,0,0,NULL,1,'2026-02-01 00:20:13','2026-02-01 00:20:25'),('187c006973da4fcfac5a86cc4cabb865','mock_openid_0286265a7ecb79ce',NULL,'13800585025',NULL,NULL,0,0,NULL,1,'2026-02-01 00:05:30','2026-02-01 00:05:44'),('21dcb10965dd433698235575215f2d8c','mock_openid_d0046fe2c8e3f3cf',NULL,'13891556364',NULL,NULL,0,0,NULL,1,'2026-02-01 00:15:09','2026-02-01 00:15:15'),('329bdd9733e84978a808e49804aa5707','mock_openid_4f61e023ad10c0cd',NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-01-31 13:03:00','2026-01-31 13:03:00'),('416b3051595240428fbd257668d2f4a3','mock_openid_781e8aacafb6a2a6',NULL,'13800138000',NULL,NULL,0,0,NULL,1,'2026-02-01 00:29:01','2026-02-01 00:29:07'),('5df4ef53d73c463e80d37806684e12ac','mock_openid_6ed4df03c06da2ab',NULL,'13829254591',NULL,NULL,0,0,NULL,1,'2026-02-01 00:07:49','2026-02-01 00:08:52'),('5fb964ee36e24090bd58190bd480c601','mock_openid_193b7092395b96e0',NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-02-01 00:02:40','2026-02-01 00:02:40'),('5fcc0be60b6c443a93c7959f22af6027','mock_openid_acc2e12ef45a5486',NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-01-31 13:22:03','2026-01-31 13:22:03'),('81ec8be9d18542a8809682c0b49cb4d1','mock_openid_2341b60fe18921e5',NULL,'13827295790',NULL,NULL,0,0,NULL,1,'2026-02-01 00:12:04','2026-02-01 00:12:11'),('877b180392ab449cb7ad6e1027756e1b','mock_openid_ea3946e1d3ba7e21',NULL,'13841702751',NULL,NULL,0,0,NULL,1,'2026-02-01 00:12:25','2026-02-01 00:12:35'),('9257195df2c840e6a30a43ccb46a1267','mock_openid_0b8ce81a784044f6',NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-01-31 13:02:48','2026-01-31 13:02:48'),('ad8b765c0a5d4ccbae2b41cc52f5e435','mock_openid_6bb7c929ba75561d',NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-01-31 13:22:17','2026-01-31 13:22:17'),('c31b73c3f7414dd0ac883ee2f32f3e1d','mock_openid_e5cc454f93fc199b',NULL,'13844974213',NULL,NULL,0,0,NULL,1,'2026-02-01 00:14:38','2026-02-01 00:14:52'),('e04bae52060a4e2eb7c2bcbf6c074d88','mock_openid_28451e7f33dd02fb',NULL,'13840751801',NULL,NULL,0,0,NULL,1,'2026-02-01 00:09:32','2026-02-01 00:09:36'),('e2fc4ed179f843f7b63ba447fa4e41fb','mock_openid_63675d4124db00bf',NULL,NULL,NULL,NULL,0,0,NULL,1,'2026-02-01 00:33:06','2026-02-01 00:33:06'),('fb70b362a63a469985d1780b0aface82','mock_openid_7a2ba047fb6078fd',NULL,'13825700200',NULL,NULL,0,0,NULL,1,'2026-02-01 00:24:31','2026-02-01 00:25:12'),('fcbe6462b72d447fbf804e808572218c','mock_openid_12968fea5973f9bd',NULL,'13811788250',NULL,NULL,0,0,NULL,1,'2026-02-01 00:26:08','2026-02-01 00:26:18'),('user_001','wx_openid_001','wx_unionid_001','13800138001','张妈妈','https://img.example.com/avatar1.jpg',500,1,'2026-06-30 23:59:59',1,'2025-12-01 10:00:00','2026-01-15 14:30:00'),('user_002','wx_openid_002','wx_unionid_002','13800138002','李爸爸','https://img.example.com/avatar2.jpg',300,1,'2026-03-31 23:59:59',1,'2025-12-05 11:20:00','2026-01-10 09:15:00'),('user_003','wx_openid_003','wx_unionid_003','13800138003','王女士','https://img.example.com/avatar3.jpg',150,1,'2026-02-28 23:59:59',1,'2025-12-10 15:30:00','2026-01-20 16:45:00'),('user_004','wx_openid_004','wx_unionid_004','13800138004','陈先生','https://img.example.com/avatar4.jpg',100,0,NULL,1,'2025-12-15 09:00:00','2026-01-25 10:20:00'),('user_005','wx_openid_005','wx_unionid_005','13800138005','刘妈妈','https://img.example.com/avatar5.jpg',50,0,NULL,1,'2025-12-20 14:10:00','2026-01-28 11:30:00'),('user_006','wx_openid_006',NULL,'13800138006','赵爸爸',NULL,0,0,NULL,1,'2026-01-05 16:20:00','2026-01-29 12:00:00'),('user_007','wx_openid_007',NULL,NULL,'微信用户007',NULL,0,0,NULL,1,'2026-01-28 10:00:00','2026-01-28 10:00:00'),('user_008','wx_openid_008',NULL,NULL,'微信用户008',NULL,0,0,NULL,1,'2026-01-29 11:00:00','2026-01-29 11:00:00');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'spot'
--

--
-- Dumping routines for database 'spot'
--
--
-- WARNING: can't read the INFORMATION_SCHEMA.libraries table. It's most probably an old server 8.0.45.
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-01 11:03:45
