-- Database Client 8.4.4
-- Host: 127.0.0.1 Port: 3306 Database: apartman_yonetim 
-- Dump is still an early version, please use the dumped SQL with caution

/*!40101 SET NAMES utf8 */;
/*!40014 SET FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET SQL_NOTES=0 */;
CREATE TABLE IF NOT EXISTS `Aidatlar` (
  `AidatID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Baslik` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Miktar` decimal(10,2) DEFAULT NULL,
  `Durum` enum('Odenmedi','Odendi') COLLATE utf8mb4_unicode_ci DEFAULT 'Odenmedi',
  `SonOdemeTarihi` date DEFAULT NULL,
  `OlusturmaTarihi` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AidatID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Aidatlar_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Kullanicilar` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Duyurular` (
  `DuyuruID` int NOT NULL AUTO_INCREMENT,
  `Baslik` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Icerik` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `Tarih` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DuyuruID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Kullanicilar` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `AdSoyad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TelNo` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Sifre` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Rol` enum('Yonetici','Sakin') COLLATE utf8mb4_unicode_ci DEFAULT 'Sakin',
  `Blok` enum('A','B','C','D') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `DaireNo` int DEFAULT NULL,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `TelNo` (`TelNo`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Sikayet_Kategorileri` (
  `KategoriID` int NOT NULL AUTO_INCREMENT,
  `Tanim` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Tur` enum('Daire','Genel') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Oncelik` enum('Normal','Acil') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`KategoriID`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Sikayetler` (
  `SikayetID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `KategoriID` int DEFAULT NULL,
  `Durum` enum('Beklemede','Islemde','Cozuldu') COLLATE utf8mb4_unicode_ci DEFAULT 'Beklemede',
  `Birim` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `TarihSaat` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SikayetID`),
  KEY `UserID` (`UserID`),
  KEY `KategoriID` (`KategoriID`),
  CONSTRAINT `Sikayetler_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Kullanicilar` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Sikayetler_ibfk_2` FOREIGN KEY (`KategoriID`) REFERENCES `Sikayet_Kategorileri` (`KategoriID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Aidatlar`(`AidatID`,`UserID`,`Baslik`,`Miktar`,`Durum`,`SonOdemeTarihi`,`OlusturmaTarihi`) VALUES(1,2,'''Ocak 2026 Aidatı''',100.00,'''Odendi''','''2026-02-01''','''2025-12-07 14:39:38'''),(2,3,'''Ocak 2026 Aidatı''',100.00,'''Odenmedi''','''2026-02-01''','''2025-12-07 14:39:38'''),(3,2,'''A''',10000.00,'''Odendi''','''2026-02-01''','''2025-12-08 07:05:40'''),(4,3,'''A''',10000.00,'''Odenmedi''','''2026-02-01''','''2025-12-08 07:05:40''');

INSERT INTO `Duyurular`(`DuyuruID`,`Baslik`,`Icerik`,`Tarih`) VALUES(1,'''Yönetim Paneline Hoş Geldiniz''','X''536974652079c3b66e6574696d2073697374656d696d697a2068697a6d657465206769726d69c59f7469722e204172c4b17a612062696c646972696d6c6572696e697a69206275726164616e207961706162696c697273696e697a2e''','''2025-12-07 14:25:52'''),(2,'''SU KESİNTİSİ''','X''534141542031322e30302d31332e303020415241534920504c414e4c49205355204b4553c4b04e54c4b053c4b0204f4c4143414b544952''','''2025-12-07 14:26:59''');

INSERT INTO `Kullanicilar`(`UserID`,`AdSoyad`,`TelNo`,`Sifre`,`Rol`,`Blok`,`DaireNo`) VALUES(1,'''Site Yoneticisi''','''1''','''1''','''Yonetici''','NULL','NULL'),(2,'''Osman Cizmeci''','''05386806394''','''123''','''Sakin''','NULL','NULL'),(3,'''Osibaba''','''2''','''2''','''Sakin''','''A''',12),(4,'''Sarp Yılmaz''','''3''','''3''','''Sakin''','''C''',8),(5,'''Mustafa Köse''','''4''','''4''','''Sakin''','''A''',9);

INSERT INTO `Sikayet_Kategorileri`(`KategoriID`,`Tanim`,`Tur`,`Oncelik`) VALUES(1,'''Damlatan Musluk / Su Sızıntısı''','''Daire''','''Normal'''),(2,'''Priz, Lamba veya Elektrik Arızası''','''Daire''','''Normal'''),(3,'''Pencere veya Kapı Kapanmıyor''','''Daire''','''Normal'''),(4,'''Isınma Sorunu / Petek Havası''','''Daire''','''Normal'''),(5,'''Böcek / Haşere İlaçlama''','''Daire''','''Normal'''),(6,'''EVİ SU BASTI (Patlak Boru)''','''Daire''','''Acil'''),(7,'''YOĞUN GAZ KOKUSU''','''Daire''','''Acil'''),(8,'''Elektrik Panosundan Duman Çıkıyor''','''Daire''','''Acil'''),(9,'''Evde Mahsur Kalma (Kapı Açılmıyor)''','''Daire''','''Acil'''),(10,'''Koridor Lambası Patlak''','''Genel''','''Normal'''),(11,'''Apartman Temizliği Yetersiz''','''Genel''','''Normal'''),(12,'''Bahçe / Peyzaj Sulama Sorunu''','''Genel''','''Normal'''),(13,'''Otopark Hatalı Park''','''Genel''','''Normal'''),(14,'''Spor Aleti Arızası''','''Genel''','''Normal'''),(15,'''ASANSÖRDE BİRİ KALDI''','''Genel''','''Acil'''),(16,'''ASANSÖR ARIZASI (Çalışmıyor)''','''Genel''','''Acil'''),(17,'''YANGIN ALARMI / DUMAN''','''Genel''','''Acil'''),(18,'''Bina Dış Kapısı Kırık/Açık''','''Genel''','''Acil'''),(19,'''Çatıdan Su Akıyor''','''Genel''','''Acil''');
INSERT INTO `Sikayetler`(`SikayetID`,`UserID`,`KategoriID`,`Durum`,`Birim`,`TarihSaat`) VALUES(1,2,17,'''Cozuldu''','NULL','''2025-12-07 10:34:51'''),(2,3,3,'''Islemde''','''REALLİFE''','''2025-12-07 14:03:03'''),(3,3,4,'''Islemde''','''TEKNİSYEN İLE GÖRÜŞÜLDÜ''','''2025-12-07 14:19:18'''),(4,5,19,'''Beklemede''','NULL','''2025-12-09 06:21:13'''),(5,3,6,'''Islemde''','''Teknisyen''','''2025-12-09 07:05:08''');