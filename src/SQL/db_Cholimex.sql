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
  `UserID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `Quantity` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CartID`),
  KEY `UserID` (`UserID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `Cart_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Cart_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Categories`;
CREATE TABLE `Categories` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(255) NOT NULL,
  `Description` text,
  `ImageURL` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `LoyaltyPoints`;
CREATE TABLE `LoyaltyPoints` (
  `PointID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Points` int NOT NULL,
  `Description` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PointID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `LoyaltyPoints_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Notification`;
CREATE TABLE `Notification` (
  `NotificationID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`NotificationID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Notification_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `OrderDetails`;
CREATE TABLE `OrderDetails` (
  `OrderDetailID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `Quantity` int NOT NULL,
  `UnitPrice` decimal(10,2) NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`OrderDetailID`),
  KEY `OrderID` (`OrderID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `OrderDetails_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`) ON DELETE CASCADE,
  CONSTRAINT `OrderDetails_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Orders`;
CREATE TABLE `Orders` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `PromotionID` int DEFAULT NULL,
  `TotalAmount` decimal(10,2) NOT NULL,
  `Status` enum('Pending','Processing','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
  `ShippingAddress` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`OrderID`),
  KEY `UserID` (`UserID`),
  KEY `PromotionID` (`PromotionID`),
  CONSTRAINT `Orders_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL,
  CONSTRAINT `Orders_ibfk_2` FOREIGN KEY (`PromotionID`) REFERENCES `Promotion` (`PromotionID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ProductCategories`;
CREATE TABLE `ProductCategories` (
  `ProductID` int NOT NULL,
  `CategoryID` int NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ProductID`,`CategoryID`),
  KEY `CategoryID` (`CategoryID`),
  CONSTRAINT `ProductCategories_ibfk_1` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE,
  CONSTRAINT `ProductCategories_ibfk_2` FOREIGN KEY (`CategoryID`) REFERENCES `Categories` (`CategoryID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Products`;
CREATE TABLE `Products` (
  `ProductID` int NOT NULL AUTO_INCREMENT,
  `ProductName` varchar(255) NOT NULL,
  `Description` text,
  `Price` decimal(10,2) NOT NULL,
  `StockQuantity` int NOT NULL,
  `ImageURL` varchar(255) DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Promotion`;
CREATE TABLE `Promotion` (
  `PromotionID` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(50) DEFAULT NULL,
  `Description` text,
  `DiscountPercentage` decimal(5,2) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PromotionID`),
  UNIQUE KEY `Code` (`Code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ResetToken`;
CREATE TABLE `ResetToken` (
  `TokenID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Token` varchar(255) NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`TokenID`),
  UNIQUE KEY `Token` (`Token`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `ResetToken_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Reviews`;
CREATE TABLE `Reviews` (
  `ReviewID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `Rating` int DEFAULT NULL,
  `Comment` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReviewID`),
  KEY `UserID` (`UserID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `Reviews_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL,
  CONSTRAINT `Reviews_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE,
  CONSTRAINT `Reviews_chk_1` CHECK ((`Rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Roles`;
CREATE TABLE `Roles` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  `Description` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `RoleID` int DEFAULT NULL,
  `FullName` varchar(255) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` text,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `RoleID` (`RoleID`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `Roles` (`RoleID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Wishlists`;
CREATE TABLE `Wishlists` (
  `WishlistID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`WishlistID`),
  KEY `UserID` (`UserID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `Wishlists_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Wishlists_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Cart` (`CartID`, `UserID`, `ProductID`, `Quantity`, `createdAt`, `updatedAt`) VALUES
(1, 2, 1, 2, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 2, 2, 1, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(3, 3, 3, 3, '2025-04-23 06:31:25', '2025-04-23 06:31:25');
INSERT INTO `Categories` (`CategoryID`, `CategoryName`, `Description`, `ImageURL`, `createdAt`, `updatedAt`) VALUES
(1, 'Nước mắm', 'Các loại nước mắm cao cấp từ Cholimex', '/images/nuoc-mam.jpg', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 'Tương ớt', 'Tương ớt cay nồng, chất lượng', '/images/tuong-ot.jpg', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(3, 'Gia vị', 'Gia vị nấu ăn đa dạng', '/images/gia-vi.jpg', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(4, 'Thực phẩm đông lạnh', 'Sản phẩm đông lạnh như chả giò, tôm viên', '/images/dong-lanh.jpg', '2025-04-23 06:31:25', '2025-04-23 06:31:25');
INSERT INTO `LoyaltyPoints` (`PointID`, `UserID`, `Points`, `Description`, `createdAt`, `updatedAt`) VALUES
(1, 2, 125, 'Điểm từ đơn hàng #1', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 3, 75, 'Điểm từ đơn hàng #2', '2025-04-23 06:31:25', '2025-04-23 06:31:25');
INSERT INTO `Notification` (`NotificationID`, `UserID`, `Title`, `Message`, `IsRead`, `createdAt`, `updatedAt`) VALUES
(1, NULL, 'Sản phẩm mới tại Cholimex!', 'Sản phẩm mới: Nước mắm Cholimex 750ml đã có mặt tại Cholimex!', 0, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 2, 'Sản phẩm mới tại Cholimex!', 'Sản phẩm mới: Tương ớt Cholimex 750g đã có mặt tại Cholimex!', 0, '2025-04-23 06:31:25', '2025-04-23 07:33:10'),
(3, 2, 'Đơn hàng mới', 'Đơn hàng #1 của bạn đang được xử lý.', 0, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(4, 3, 'Sản phẩm mới tại Cholimex!', 'Sản phẩm mới: Nước mắm Cholimex 500ml đã có mặt tại Cholimex!', 0, '2025-04-23 06:57:53', '2025-04-23 07:33:10'),
(5, 5, 'Sản phẩm mới tại Cholimex!', 'Sản phẩm mới: Nước mắm Cholimex 100ml đã có mặt tại Cholimex!', 0, '2025-04-23 07:30:48', '2025-04-23 07:32:55');
INSERT INTO `OrderDetails` (`OrderDetailID`, `OrderID`, `ProductID`, `Quantity`, `UnitPrice`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 2, '45000.00', '2025-04-23 06:33:32', '2025-04-23 06:33:32'),
(2, 1, 2, 1, '35000.00', '2025-04-23 06:33:32', '2025-04-23 06:33:32'),
(3, 2, 3, 3, '25000.00', '2025-04-23 06:33:32', '2025-04-23 06:33:32');
INSERT INTO `Orders` (`OrderID`, `UserID`, `PromotionID`, `TotalAmount`, `Status`, `ShippingAddress`, `createdAt`, `updatedAt`) VALUES
(1, 2, 1, '125000.00', 'Pending', '456 Đường Lê Lợi, TP.HCM', '2025-04-23 06:33:31', '2025-04-23 06:33:31'),
(2, 3, NULL, '75000.00', 'Shipped', '789 Đường Nguyễn Huệ, TP.HCM', '2025-04-23 06:33:31', '2025-04-23 06:33:31');
INSERT INTO `ProductCategories` (`ProductID`, `CategoryID`, `createdAt`, `updatedAt`) VALUES
(1, 1, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 2, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 3, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(3, 3, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(4, 4, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(9, 1, '2025-04-23 06:57:53', '2025-04-23 06:57:53'),
(10, 1, '2025-04-23 07:30:48', '2025-04-23 07:30:48');
INSERT INTO `Products` (`ProductID`, `ProductName`, `Description`, `Price`, `StockQuantity`, `ImageURL`, `createdAt`, `updatedAt`) VALUES
(1, 'Nước mắm Cholimex 750ml', 'Nước mắm nguyên chất, đậm đà', '45000.00', 100, '/images/nuoc-mam-750ml.jpg', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 'Tương ớt Cholimex 750g', 'Tương ớt cay nồng, dung tích lớn', '35000.00', 50, '/images/tuong-ot-750g.jpg', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(3, 'Bột gia vị Cholimex 200g', 'Gia vị nêm nếm đa năng', '25000.00', 200, '/images/bot-gia-vi.jpg', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(4, 'Chả giò tôm Cholimex 500g', 'Chả giò tôm đông lạnh, tiện lợi', '65000.00', 30, '/images/cha-gio.jpg', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(9, 'Nước mắm Cholimex 500ml', 'Nước mắm cao cấp, dung tích nhỏ', '30000.00', 80, '/images/nuoc-mam-500ml.jpg', '2025-04-23 06:57:53', '2025-04-23 06:57:53'),
(10, 'Nước mắm Cholimex 100ml', 'Nước mắm cao cấp, dung tích nhỏ', '50000.00', 80, '/images/nuoc-mam-500ml.jpg', '2025-04-23 07:30:48', '2025-04-23 07:30:48');
INSERT INTO `Promotion` (`PromotionID`, `Code`, `Description`, `DiscountPercentage`, `StartDate`, `EndDate`, `createdAt`, `updatedAt`) VALUES
(1, 'CHOLIMEX10', 'Giảm 10% cho đơn hàng đầu tiên', '10.00', '2025-04-01 00:00:00', '2025-12-31 23:59:59', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 'SUMMER20', 'Giảm 20% mùa hè', '20.00', '2025-06-01 00:00:00', '2025-08-31 23:59:59', '2025-04-23 06:31:25', '2025-04-23 06:31:25');
INSERT INTO `ResetToken` (`TokenID`, `UserID`, `Token`, `ExpiresAt`, `createdAt`, `updatedAt`) VALUES
(1, 2, 'sampletoken1234567890', '2025-04-22 11:00:00', '2025-04-23 06:31:25', '2025-04-23 06:31:25');
INSERT INTO `Reviews` (`ReviewID`, `UserID`, `ProductID`, `Rating`, `Comment`, `createdAt`, `updatedAt`) VALUES
(1, 2, 1, 5, 'Nước mắm rất thơm, đậm vị!', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 3, 2, 4, 'Tương ớt cay vừa đủ, rất ngon.', '2025-04-23 06:31:25', '2025-04-23 06:31:25');
INSERT INTO `Roles` (`RoleID`, `RoleName`, `Description`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', 'Quản trị viên hệ thống', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 'user', 'Người dùng thông thường', '2025-04-23 06:31:25', '2025-04-23 06:31:25');
INSERT INTO `Users` (`UserID`, `RoleID`, `FullName`, `Email`, `Password`, `Phone`, `Address`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Admin User', 'admin@example.com', '$2a$10$zX8k8g7f8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p', '0901234567', '123 Đường Vĩnh Lộc, TP.HCM', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 2, 'John Doe', 'user1@example.com', '$2a$10$zX8k8g7f8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p', '0908765432', '456 Đường Lê Lợi, TP.HCM', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(3, 2, 'Jane Smith', 'user2@example.com', '$2a$10$zX8k8g7f8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p', '0912345678', '789 Đường Nguyễn Huệ, TP.HCM', '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(4, 1, 'admin', 'admin@gmail.com', '$2b$10$r1A8fs7/CcoxI9IHeGnJFe/ZrQx0eRqvpQ0Nv.kVrkmOtQuab8Som', '123456789', 'HCM', '2025-04-23 06:48:36', '2025-04-23 06:51:49'),
(5, 2, 'test', 'test@gmail.com', '$2b$10$r1A8fs7/CcoxI9IHeGnJFe/ZrQx0eRqvpQ0Nv.kVrkmOtQuab8Som', '123456789', 'HCM', '2025-04-23 06:48:36', '2025-04-23 06:51:49');
INSERT INTO `Wishlists` (`WishlistID`, `UserID`, `ProductID`, `createdAt`, `updatedAt`) VALUES
(1, 2, 3, '2025-04-23 06:31:25', '2025-04-23 06:31:25'),
(2, 3, 4, '2025-04-23 06:31:25', '2025-04-23 06:31:25');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;