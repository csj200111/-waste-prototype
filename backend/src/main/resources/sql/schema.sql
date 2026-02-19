-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: waste_db
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Table structure for table `large_waste_fee`
--

DROP TABLE IF EXISTS `large_waste_fee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `large_waste_fee` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `시도명` varchar(255) DEFAULT NULL,
  `시군구명` varchar(255) DEFAULT NULL,
  `대형폐기물명` varchar(255) DEFAULT NULL,
  `대형폐기물구분명` varchar(255) DEFAULT NULL,
  `대형폐기물규격` varchar(255) DEFAULT NULL,
  `유무료여부` varchar(255) DEFAULT NULL,
  `수수료` int DEFAULT NULL,
  `관리기관명` varchar(255) DEFAULT NULL,
  `데이터기준일자` date DEFAULT NULL,
  `제공기관코드` varchar(20) DEFAULT NULL,
  `제공기관명` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_시도명` (`시도명`),
  KEY `idx_시군구명` (`시군구명`),
  KEY `idx_대형폐기물명` (`대형폐기물명`)
) ENGINE=InnoDB AUTO_INCREMENT=22820 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `waste_facility`
--

DROP TABLE IF EXISTS `waste_facility`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `waste_facility` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `시설명` varchar(255) DEFAULT NULL,
  `소재지도로명주소` varchar(255) DEFAULT NULL,
  `소재지지번주소` varchar(255) DEFAULT NULL,
  `위도` decimal(38,2) DEFAULT NULL,
  `경도` decimal(38,2) DEFAULT NULL,
  `업종명` varchar(255) DEFAULT NULL,
  `전문처리분야명` varchar(255) DEFAULT NULL,
  `처리폐기물정보` varchar(255) DEFAULT NULL,
  `영업구역` varchar(255) DEFAULT NULL,
  `시설장비명` varchar(255) DEFAULT NULL,
  `허가일자` date DEFAULT NULL,
  `전화번호` varchar(255) DEFAULT NULL,
  `관리기관명` varchar(255) DEFAULT NULL,
  `데이터기준일자` date DEFAULT NULL,
  `제공기관코드` varchar(255) DEFAULT NULL,
  `제공기관명` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_시설명` (`시설명`),
  KEY `idx_업종명` (`업종명`),
  KEY `idx_소재지도로명주소` (`소재지도로명주소`(100))
) ENGINE=InnoDB AUTO_INCREMENT=9114 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-19 22:55:28
