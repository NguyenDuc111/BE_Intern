/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

DROP TABLE IF EXISTS `Cart`;
CREATE TABLE `Cart` (
  `CartID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Quantity` int NOT NULL,
  `AddedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`CartID`),
  KEY `idx_user_id` (`UserID`),
  KEY `idx_product_id` (`ProductID`),
  CONSTRAINT `Cart_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Cart_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Categories`;
CREATE TABLE `Categories` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(100) NOT NULL,
  `Description` text,
  `ImageURL` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CategoryID`),
  KEY `idx_category_name` (`CategoryName`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `OrderDetails`;
CREATE TABLE `OrderDetails` (
  `OrderDetailID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Quantity` int NOT NULL,
  `Price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`OrderDetailID`),
  KEY `idx_order_id` (`OrderID`),
  KEY `idx_product_id` (`ProductID`),
  CONSTRAINT `OrderDetails_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`) ON DELETE CASCADE,
  CONSTRAINT `OrderDetails_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Orders`;
CREATE TABLE `Orders` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `TotalAmount` decimal(10,2) NOT NULL,
  `Status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`OrderID`),
  KEY `idx_user_id` (`UserID`),
  KEY `idx_status` (`Status`),
  CONSTRAINT `Orders_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Products`;
CREATE TABLE `Products` (
  `ProductID` int NOT NULL AUTO_INCREMENT,
  `CategoryID` int NOT NULL,
  `ProductName` varchar(100) NOT NULL,
  `Description` text,
  `Price` decimal(10,2) NOT NULL,
  `StockQuantity` int NOT NULL DEFAULT '0',
  `ImageURL` varchar(255) DEFAULT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ProductID`),
  KEY `idx_product_name` (`ProductName`),
  KEY `idx_category_id` (`CategoryID`),
  CONSTRAINT `Products_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `Categories` (`CategoryID`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Promotions`;
CREATE TABLE `Promotions` (
  `PromotionID` int NOT NULL AUTO_INCREMENT,
  `ProductID` int NOT NULL,
  `DiscountPercentage` decimal(5,2) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PromotionID`),
  KEY `idx_product_id` (`ProductID`),
  CONSTRAINT `Promotions_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE,
  CONSTRAINT `Promotions_chk_1` CHECK (((`DiscountPercentage` >= 0) and (`DiscountPercentage` <= 100))),
  CONSTRAINT `Promotions_chk_2` CHECK ((`EndDate` >= `StartDate`))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ResetTokens`;
CREATE TABLE `ResetTokens` (
  `TokenID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `Token` varchar(255) NOT NULL,
  `ExpiresAt` timestamp NOT NULL,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`TokenID`),
  KEY `idx_token` (`Token`),
  KEY `idx_user_id` (`UserID`),
  CONSTRAINT `ResetTokens_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Reviews`;
CREATE TABLE `Reviews` (
  `ReviewID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Rating` int NOT NULL,
  `Comment` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReviewID`),
  KEY `idx_user_id` (`UserID`),
  KEY `idx_product_id` (`ProductID`),
  CONSTRAINT `Reviews_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Reviews_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE,
  CONSTRAINT `Reviews_chk_1` CHECK (((`Rating` >= 1) and (`Rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Roles`;
CREATE TABLE `Roles` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  `Description` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`),
  KEY `idx_role_name` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `RoleID` int NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` text,
  `CreatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `idx_email` (`Email`),
  KEY `idx_role_id` (`RoleID`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `Roles` (`RoleID`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Cart` (`CartID`, `UserID`, `ProductID`, `Quantity`, `AddedAt`) VALUES
(1, 1, 1, 2, '2025-04-22 07:50:18'),
(2, 1, 3, 1, '2025-04-22 07:50:18');
INSERT INTO `Categories` (`CategoryID`, `CategoryName`, `Description`, `ImageURL`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'Tương ớt', 'Các loại tương ớt Cholimex, phù hợp cho nhiều món ăn', '/images/tuong-ot-category.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(2, 'Nước mắm', 'Nước mắm nguyên chất và cao cấp từ Cholimex', '/images/nuoc-mam-category.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(3, 'Gia vị', 'Gia vị và hạt nêm Cholimex, tăng hương vị món ăn', '/images/gia-vi-category.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(4, 'Sốt chấm', 'Các loại sốt chấm đa dạng, đậm đà hương vị', '/images/sot-cham-category.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18');
INSERT INTO `OrderDetails` (`OrderDetailID`, `OrderID`, `ProductID`, `Quantity`, `Price`) VALUES
(1, 1, 1, 2, '15000.00'),
(2, 2, 3, 1, '25000.00');
INSERT INTO `Orders` (`OrderID`, `UserID`, `TotalAmount`, `Status`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, '30000.00', 'pending', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(2, 1, '25000.00', 'completed', '2025-04-22 07:50:18', '2025-04-22 07:50:18');
INSERT INTO `Products` (`ProductID`, `CategoryID`, `ProductName`, `Description`, `Price`, `StockQuantity`, `ImageURL`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'Tương ớt Cholimex 250g', 'Tương ớt cay nồng, hương vị đậm đà, phù hợp chấm và nấu ăn', '15000.00', 100, '/images/tuong-ot-250g.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(2, 1, 'Tương ớt Cholimex 500g', 'Tương ớt cay, dung tích lớn, dùng cho gia đình', '28000.00', 50, '/images/tuong-ot-500g.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(3, 2, 'Nước mắm Cholimex 500ml', 'Nước mắm nguyên chất, thượng hạng, đậm đà hương vị biển', '25000.00', 50, '/images/nuoc-mam-500ml.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(4, 2, 'Nước mắm Cholimex 1L', 'Nước mắm cao cấp, dung tích lớn, tiết kiệm chi phí', '45000.00', 30, '/images/nuoc-mam-1l.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(5, 3, 'Hạt nêm Cholimex 200g', 'Hạt nêm đậm đà, tăng hương vị cho món canh và xào', '20000.00', 80, '/images/hat-nem-200g.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(6, 4, 'Sốt mayonnaise Cholimex 130g', 'Sốt mayonnaise béo ngậy, dùng cho salad và bánh mì', '18000.00', 60, '/images/mayonnaise-130g.jpg', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(7, 1, 'Tương ớt Cholimex 250g', 'Tương ớt cay nồng, hương vị đậm đà, phù hợp chấm và nấu ăn', '15000.00', 100, '/images/tuong-ot-250g.jpg', '2025-04-23 01:23:32', '2025-04-23 01:23:32'),
(8, 1, 'Tương ớt Cholimex 500g', 'Tương ớt cay, dung tích lớn, dùng cho gia đình', '28000.00', 50, '/images/tuong-ot-500g.jpg', '2025-04-23 01:23:32', '2025-04-23 01:23:32'),
(9, 2, 'Nước mắm Cholimex 500ml', 'Nước mắm nguyên chất, thượng hạng, đậm đà hương vị biển', '25000.00', 50, '/images/nuoc-mam-500ml.jpg', '2025-04-23 01:23:32', '2025-04-23 01:23:32'),
(10, 2, 'Nước mắm Cholimex 1L', 'Nước mắm cao cấp, dung tích lớn, tiết kiệm chi phí', '45000.00', 30, '/images/nuoc-mam-1l.jpg', '2025-04-23 01:23:32', '2025-04-23 01:23:32'),
(11, 3, 'Hạt nêm Cholimex 200g', 'Hạt nêm đậm đà, tăng hương vị cho món canh và xào', '20000.00', 80, '/images/hat-nem-200g.jpg', '2025-04-23 01:23:32', '2025-04-23 01:23:32'),
(12, 4, 'Sốt mayonnaise Cholimex 130g', 'Sốt mayonnaise béo ngậy, dùng cho salad và bánh mì', '18000.00', 60, '/images/mayonnaise-130g.jpg', '2025-04-23 01:23:32', '2025-04-23 01:23:32');
INSERT INTO `Promotions` (`PromotionID`, `ProductID`, `DiscountPercentage`, `StartDate`, `EndDate`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, '10.00', '2025-04-01', '2025-04-30', '2025-04-23 01:22:29', '2025-04-23 01:22:29'),
(2, 3, '15.00', '2025-05-01', '2025-05-15', '2025-04-23 01:22:29', '2025-04-23 01:22:29'),
(3, 5, '5.00', '2025-04-15', '2025-04-20', '2025-04-23 01:22:29', '2025-04-23 01:22:29'),
(4, 1, '10.00', '2025-04-01', '2025-04-30', '2025-04-23 01:23:32', '2025-04-23 01:23:32'),
(5, 3, '15.00', '2025-05-01', '2025-05-15', '2025-04-23 01:23:32', '2025-04-23 01:23:32'),
(6, 5, '5.00', '2025-04-15', '2025-04-20', '2025-04-23 01:23:32', '2025-04-23 01:23:32');


INSERT INTO `Roles` (`RoleID`, `RoleName`, `Description`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 'user', 'Người dùng thông thường, có thể mua sắm và quản lý đơn hàng cá nhân', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(2, 'admin', 'Quản trị viên, có quyền quản lý toàn bộ hệ thống, bao gồm đơn hàng và sản phẩm', '2025-04-22 07:50:18', '2025-04-22 07:50:18');
INSERT INTO `Users` (`UserID`, `RoleID`, `FullName`, `Email`, `Password`, `Phone`, `Address`, `CreatedAt`, `UpdatedAt`) VALUES
(1, 1, 'Nguyen Van A', 'user1@example.com', '$2a$10$z9y8X3k1Qw2mR5v6b7n8Ou9pK4lJ3mN2oP5qR7t8u9v0w1x2y3z4A', '0123456789', '123 Hanoi', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(3, 2, 'Admin User', 'admin@example.com', '$2a$10$z9y8X3k1Qw2mR5v6b7n8Ou9pK4lJ3mN2oP5qR7t8u9v0w1x2y3z4A', '0912345678', '789 Hanoi', '2025-04-22 07:50:18', '2025-04-22 07:50:18'),
(4, 1, 'Nguyen Van VA', 'hau@test.com', '$2a$10$3I5h6aCZm5eCMfe0nyW51OPh5ZhdO0SC02dNlzDIOHEm6/PLcoODa', '123456789', 'HCM', '2025-04-22 08:00:03', '2025-04-22 08:00:03'),
(5, 2, 'admin', 'admin@test.com', '$2a$10$zsrmo3TISphe6wMq1tdKF.U2qgWRyrLLI0ci97qg2cMW5RgBejUCy', '123456789', 'HCM', '2025-04-22 08:09:39', '2025-04-22 08:20:00');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;