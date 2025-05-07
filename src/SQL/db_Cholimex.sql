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
  PRIMARY KEY (`CartID`),
  KEY `UserID` (`UserID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `Cart_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Cart_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Categories`;
CREATE TABLE `Categories` (
  `CategoryID` int NOT NULL AUTO_INCREMENT,
  `CategoryName` varchar(255) NOT NULL,
  `Description` text,
  `ImageURL` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`CategoryID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `LoyaltyPoints`;
CREATE TABLE `LoyaltyPoints` (
  `PointID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Points` int NOT NULL,
  `Description` text,
  PRIMARY KEY (`PointID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `LoyaltyPoints_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=62 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Notification`;
CREATE TABLE `Notification` (
  `NotificationID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Title` varchar(255) NOT NULL,
  `Message` text NOT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`NotificationID`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `Notification_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `OrderDetails`;
CREATE TABLE `OrderDetails` (
  `OrderDetailID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `Quantity` int NOT NULL,
  `UnitPrice` decimal(10,2) NOT NULL,
  PRIMARY KEY (`OrderDetailID`),
  KEY `OrderID` (`OrderID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `OrderDetails_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`) ON DELETE CASCADE,
  CONSTRAINT `OrderDetails_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Orders`;
CREATE TABLE `Orders` (
  `OrderID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `PromotionID` int DEFAULT NULL,
  `TotalAmount` decimal(10,2) NOT NULL,
  `Status` enum('Pending','Processing','Paid','Cancelled') DEFAULT 'Pending',
  `ShippingAddress` text,
  `VoucherCode` varchar(6) DEFAULT NULL,
  PRIMARY KEY (`OrderID`),
  KEY `UserID` (`UserID`),
  KEY `PromotionID` (`PromotionID`),
  KEY `Orders_ibfk_3` (`VoucherCode`),
  CONSTRAINT `Orders_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL,
  CONSTRAINT `Orders_ibfk_2` FOREIGN KEY (`PromotionID`) REFERENCES `Promotion` (`PromotionID`) ON DELETE SET NULL,
  CONSTRAINT `Orders_ibfk_3` FOREIGN KEY (`VoucherCode`) REFERENCES `UserVouchers` (`Code`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ProductCategories`;
CREATE TABLE `ProductCategories` (
  `ProductID` int NOT NULL,
  `CategoryID` int NOT NULL,
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
  `Ingredients` text,
  PRIMARY KEY (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Promotion`;
CREATE TABLE `Promotion` (
  `PromotionID` int NOT NULL AUTO_INCREMENT,
  `Code` varchar(50) DEFAULT NULL,
  `Description` text,
  `DiscountPercentage` decimal(5,2) DEFAULT NULL,
  `StartDate` datetime DEFAULT NULL,
  `EndDate` datetime DEFAULT NULL,
  PRIMARY KEY (`PromotionID`),
  UNIQUE KEY `Code` (`Code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `RedemptionHistory`;
CREATE TABLE `RedemptionHistory` (
  `RedemptionID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `PointsUsed` int NOT NULL,
  `RedemptionType` varchar(50) NOT NULL,
  `VoucherID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `Status` enum('pending','completed','failed') DEFAULT 'completed',
  PRIMARY KEY (`RedemptionID`),
  KEY `UserID` (`UserID`),
  KEY `VoucherID` (`VoucherID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `RedemptionHistory_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `RedemptionHistory_ibfk_2` FOREIGN KEY (`VoucherID`) REFERENCES `Vouchers` (`VoucherID`) ON DELETE SET NULL,
  CONSTRAINT `RedemptionHistory_ibfk_3` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `ResetToken`;
CREATE TABLE `ResetToken` (
  `TokenID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `Token` varchar(255) NOT NULL,
  `ExpiresAt` datetime NOT NULL,
  PRIMARY KEY (`TokenID`),
  UNIQUE KEY `Token` (`Token`),
  KEY `UserID` (`UserID`),
  CONSTRAINT `ResetToken_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Reviews`;
CREATE TABLE `Reviews` (
  `ReviewID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  `Rating` int DEFAULT NULL,
  `Comment` text,
  PRIMARY KEY (`ReviewID`),
  KEY `UserID` (`UserID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `Reviews_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE SET NULL,
  CONSTRAINT `Reviews_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE,
  CONSTRAINT `Reviews_chk_1` CHECK ((`Rating` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Roles`;
CREATE TABLE `Roles` (
  `RoleID` int NOT NULL AUTO_INCREMENT,
  `RoleName` varchar(50) NOT NULL,
  `Description` text,
  PRIMARY KEY (`RoleID`),
  UNIQUE KEY `RoleName` (`RoleName`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `TempOrderItems`;
CREATE TABLE `TempOrderItems` (
  `TempID` int NOT NULL AUTO_INCREMENT,
  `OrderID` int NOT NULL,
  `ProductID` int NOT NULL,
  `Quantity` int NOT NULL,
  PRIMARY KEY (`TempID`),
  KEY `OrderID` (`OrderID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `TempOrderItems_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `Orders` (`OrderID`),
  CONSTRAINT `TempOrderItems_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `UserRedemptionLimits`;
CREATE TABLE `UserRedemptionLimits` (
  `UserID` int NOT NULL,
  `VoucherID` int NOT NULL,
  `RedemptionCount` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`UserID`,`VoucherID`),
  KEY `VoucherID` (`VoucherID`),
  CONSTRAINT `UserRedemptionLimits_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `UserRedemptionLimits_ibfk_2` FOREIGN KEY (`VoucherID`) REFERENCES `Vouchers` (`VoucherID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `RoleID` int DEFAULT NULL,
  `FullName` varchar(255) DEFAULT NULL,
  `Email` varchar(255) DEFAULT NULL,
  `Password` varchar(255) DEFAULT NULL,
  `Phone` varchar(20) DEFAULT NULL,
  `Address` text,
  PRIMARY KEY (`UserID`),
  UNIQUE KEY `Email` (`Email`),
  KEY `RoleID` (`RoleID`),
  CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`RoleID`) REFERENCES `Roles` (`RoleID`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `UserVouchers`;
CREATE TABLE `UserVouchers` (
  `UserVoucherID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NOT NULL,
  `VoucherID` int NOT NULL,
  `Code` varchar(6) NOT NULL,
  `Status` enum('active','used','expired') DEFAULT 'active',
  `UsageCount` int DEFAULT '0',
  `ExpiryDate` datetime NOT NULL,
  PRIMARY KEY (`UserVoucherID`),
  UNIQUE KEY `Code` (`Code`),
  KEY `UserID` (`UserID`),
  KEY `VoucherID` (`VoucherID`),
  CONSTRAINT `UserVouchers_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `UserVouchers_ibfk_2` FOREIGN KEY (`VoucherID`) REFERENCES `Vouchers` (`VoucherID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Vouchers`;
CREATE TABLE `Vouchers` (
  `VoucherID` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `DiscountValue` decimal(10,2) NOT NULL,
  `PointsRequired` int NOT NULL,
  `UsageLimit` int NOT NULL,
  `ExpiryDays` int NOT NULL,
  `RedemptionLimit` int NOT NULL DEFAULT '1',
  `MinOrderValue` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`VoucherID`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `Wishlists`;
CREATE TABLE `Wishlists` (
  `WishlistID` int NOT NULL AUTO_INCREMENT,
  `UserID` int DEFAULT NULL,
  `ProductID` int DEFAULT NULL,
  PRIMARY KEY (`WishlistID`),
  KEY `UserID` (`UserID`),
  KEY `ProductID` (`ProductID`),
  CONSTRAINT `Wishlists_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `Users` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `Wishlists_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `Products` (`ProductID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO `Cart` (`CartID`, `UserID`, `ProductID`, `Quantity`) VALUES
(4, 6, 10, 10),
(5, 6, 6, 10),
(38, 5, 4, 1),
(43, 9, 4, 45);
INSERT INTO `Categories` (`CategoryID`, `CategoryName`, `Description`, `ImageURL`) VALUES
(1, 'Nước mắm', 'Các loại nước mắm cao cấp từ Cholimex', '/images/nuoc-mam.jpg'),
(2, 'Tương ớt', 'Tương ớt cay nồng, chất lượng', '/images/tuong-ot.jpg'),
(3, 'Gia vị', 'Gia vị nấu ăn đa dạng', '/images/gia-vi.jpg'),
(4, 'Thực phẩm đông lạnh', 'Sản phẩm đông lạnh như chả giò, tôm viên', '/images/dong-lanh.jpg');
INSERT INTO `LoyaltyPoints` (`PointID`, `UserID`, `Points`, `Description`) VALUES
(1, 2, 100, 'Cập nhật điểm tích lũy cho đơn hàng mới'),
(2, 3, 75, 'Điểm từ đơn hàng #2'),
(3, 5, 75, 'Điểm từ đơn hàng #2'),
(5, 5, 2, 'Tích điểm từ đơn hàng #19'),
(6, 5, -20, 'Dùng 20 điểm để giảm giá đơn hàng'),
(31, 5, -12, 'Dùng 12 điểm để giảm giá đơn hàng'),
(32, 5, -5, 'Dùng 5 điểm để giảm giá đơn hàng'),
(33, 5, -2, 'Dùng 2 điểm để giảm giá đơn hàng'),
(34, 5, -8, 'Dùng 8 điểm để giảm giá đơn hàng'),
(35, 9, 100, 'Điểm từ đơn hàng #2'),
(36, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(37, 9, -3, 'Dùng 3 điểm để giảm giá đơn hàng'),
(38, 9, -15, 'Đổi voucher Giảm 10%'),
(39, 9, -2, 'Dùng 2 điểm để giảm giá đơn hàng'),
(40, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(41, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(42, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(43, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(44, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(45, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(46, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(47, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(48, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(49, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(50, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(51, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(52, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(53, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(54, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(55, 9, 100, 'Điểm từ đơn hàng #2'),
(56, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(57, 9, -5, 'Đổi voucher Giảm 10,000 VND'),
(58, 9, -40, 'Đổi voucher Giảm 100,000 VND'),
(59, 5, -5, 'Đổi voucher Giảm 10,000 VND'),
(60, 5, -20, 'Đổi voucher Giảm 50,000 VND'),
(61, 9, -10, 'Đổi voucher Giảm 20,000 VND');
INSERT INTO `Notification` (`NotificationID`, `UserID`, `Title`, `Message`, `IsRead`) VALUES
(1, NULL, 'Sản phẩm mới tại Cholimex!', 'Sản phẩm mới: Nước mắm Cholimex 750ml đã có mặt tại Cholimex!', 1),
(2, 2, 'Sản phẩm mới tại Cholimex!', 'Sản phẩm mới: Tương ớt Cholimex 750g đã có mặt tại Cholimex!', 0),
(3, 2, 'Đơn hàng mới', 'Đơn hàng #1 của bạn đang được xử lý.', 0),
(4, 3, 'Sản phẩm mới tại Cholimex!', 'Sản phẩm mới: Nước mắm Cholimex 500ml đã có mặt tại Cholimex!', 0),
(5, 5, 'Sản phẩm mới tại Cholimex!', 'Sản phẩm mới: Nước mắm Cholimex 100ml đã có mặt tại Cholimex!', 1),
(7, NULL, 'Mừng ngày lễ', 'voucher giảm giá cho ngày lễ', 1),
(8, 5, 'teset', 'test', 1);
INSERT INTO `OrderDetails` (`OrderDetailID`, `OrderID`, `ProductID`, `Quantity`, `UnitPrice`) VALUES
(17, 52, 3, 1, '15000.00'),
(18, 71, 3, 16, '15000.00'),
(19, 71, 8, 1, '30000.00'),
(20, 73, 3, 2, '15000.00'),
(21, 74, 8, 2, '30000.00'),
(22, 75, 5, 1, '10000.00');
INSERT INTO `Orders` (`OrderID`, `UserID`, `PromotionID`, `TotalAmount`, `Status`, `ShippingAddress`, `VoucherCode`) VALUES
(20, 5, 1, '2320000.00', 'Paid', 'HCM', NULL),
(21, 5, NULL, '260000.00', 'Cancelled', 'acx', NULL),
(47, 5, NULL, '1113000.00', 'Processing', 'asxzxczcxczxc', NULL),
(48, 5, NULL, '1095000.00', 'Cancelled', 'asdzxc', NULL),
(49, 5, NULL, '210000.00', 'Cancelled', 'zxczxc', NULL),
(50, 5, NULL, '60000.00', 'Cancelled', 'vvvv', NULL),
(52, 5, NULL, '15000.00', 'Paid', 'il', NULL),
(54, 5, 1, '54000.00', 'Processing', '123', NULL),
(55, 5, NULL, '88000.00', 'Cancelled', 'asdasdasd', NULL),
(56, 5, NULL, '15000.00', 'Pending', 'axzccxzzcxzxczxc', NULL),
(57, 5, NULL, '15000.00', 'Pending', 'd', NULL),
(59, 5, NULL, '28000.00', 'Pending', 'olololl', NULL),
(60, 5, NULL, '15000.00', 'Pending', 'asdsasdsad', NULL),
(61, 5, NULL, '45000.00', 'Pending', 'asdsadsad', NULL),
(70, 5, NULL, '45000.00', 'Pending', 'zxc', NULL),
(71, 9, NULL, '262000.00', 'Paid', 'zxc', NULL),
(72, 9, NULL, '45000.00', 'Paid', '123', NULL),
(73, 9, NULL, '27000.00', 'Paid', 'asd', NULL),
(74, 9, NULL, '52000.00', 'Paid', 'asd', NULL),
(75, 9, NULL, '10000.00', 'Paid', 'asd', NULL);
INSERT INTO `ProductCategories` (`ProductID`, `CategoryID`) VALUES
(1, 1),
(2, 1),
(7, 1),
(13, 1),
(3, 2),
(6, 2),
(10, 2),
(12, 2),
(4, 3),
(8, 3),
(14, 3),
(5, 4),
(9, 4),
(11, 4),
(15, 4);
INSERT INTO `Products` (`ProductID`, `ProductName`, `Description`, `Price`, `StockQuantity`, `ImageURL`, `Ingredients`) VALUES
(1, 'Nước mắm Cholimex 500ml', 'Nước mắm truyền thống được làm từ cá cơm tươi ngon, ủ lên men tự nhiên, đậm đà hương vị.', '25000.00', 100, NULL, 'Cá cơm, muối, nước'),
(2, 'Nước mắm Cholimex 1L', 'Nước mắm nguyên chất, đóng chai lớn 1L, phù hợp cho gia đình đông người.', '45000.00', 49, NULL, 'Cá cơm, muối, nước'),
(3, 'Tương ớt Cholimex 200g', 'Tương ớt cay nồng, được làm từ ớt tươi, thêm tỏi thơm, thích hợp ăn kèm nhiều món.', '15000.00', 142, 'https://cholimexfood.com.vn/wp-content/uploads/2019/12/TUONG-OT-250G-500x500.png', 'Ớt, tỏi, đường, muối'),
(4, 'Nước tương Cholimex 300ml', 'Nước tương đậm đà, làm từ đậu nành tự nhiên, dùng để chấm hoặc ướp món ăn.', '20000.00', 36, NULL, 'Đậu nành, muối, đường'),
(5, 'Gia vị nêm Cholimex 100g', 'Gia vị nêm đa dụng, giúp món ăn thêm đậm đà, dễ sử dụng cho các món canh, xào.', '10000.00', 147, NULL, 'Muối, đường, bột ngọt'),
(6, 'Tương ớt Cholimex 500g', 'Tương ớt cay đậm, đóng gói lớn 500g, phù hợp cho nhà hàng hoặc gia đình đông người.', '30000.00', 128, NULL, 'Ớt, tỏi, đường, muối'),
(7, 'Nước mắm Cholimex Cao cấp 750ml', 'Nước mắm cao cấp, độ đạm cao, hương vị tinh tế, dùng cho các món ăn cao cấp.', '60000.00', 60, NULL, 'Cá cơm, muối, nước, đường'),
(8, 'Nước tương Cholimex 500ml', 'Nước tương tự nhiên, đóng chai 500ml, phù hợp để ướp thịt, cá hoặc làm nước chấm.', '30000.00', 53, 'https://cholimexfood.com.vn/wp-content/uploads/2019/12/TUONG-OT-250G-500x500.png', 'Đậu nành, muối, đường'),
(9, 'Gia vị nêm Cholimex 200g', 'Gia vị nêm tiện lợi, đóng gói 200g, giúp món ăn thêm ngon, phù hợp mọi bữa ăn.', '18000.00', 179, NULL, 'Muối, đường, bột ngọt'),
(10, 'Tương cà Cholimex 300g', 'Tương cà thơm ngon, làm từ cà chua tươi, dùng để chấm hoặc nấu ăn.', '20000.00', 105, NULL, 'Cà chua, đường, muối, giấm'),
(11, 'Dầu hào Cholimex 250ml', 'Dầu hào đậm đà, chiết xuất từ hàu, dùng để ướp hoặc xào các món rau, thịt.', '25000.00', 69, NULL, 'Hàu, muối, đường, bột ngọt'),
(12, 'Muối ớt Cholimex 100g', 'Muối ớt cay thơm, dùng để chấm hải sản, trái cây hoặc thêm vào món ăn.', '12000.00', 139, NULL, 'Muối, ớt, tỏi'),
(13, 'Nước mắm Cholimex Hạ muối 500ml', 'Nước mắm ít muối, phù hợp cho người ăn kiêng, vẫn giữ được hương vị đậm đà.', '28000.00', 75, NULL, 'Cá cơm, muối, nước'),
(14, 'Tương đen Cholimex 200g', 'Tương đen thơm ngon, làm từ đậu nành lên men, dùng để chấm hoặc nấu món ăn.', '22000.00', 85, NULL, 'Đậu nành, muối, đường, tỏi'),
(15, 'Gia vị lẩu Cholimex 150g', 'Gia vị lẩu tiện lợi, giúp nồi lẩu thêm đậm đà, phù hợp cho các bữa tiệc gia đình.', '15000.00', 121, NULL, 'Muối, ớt, bột ngọt, gia vị lẩu');
INSERT INTO `Promotion` (`PromotionID`, `Code`, `Description`, `DiscountPercentage`, `StartDate`, `EndDate`) VALUES
(1, 'CHOLIMEX10', 'Giảm 10% cho đơn hàng đầu tiên', '10.00', '2025-04-01 00:00:00', '2025-12-31 23:59:59'),
(2, 'SUMMER20', 'Giảm 20% mùa hè', '20.00', '2025-06-01 00:00:00', '2025-08-31 23:59:59');

INSERT INTO `ResetToken` (`TokenID`, `UserID`, `Token`, `ExpiresAt`) VALUES
(1, 2, 'sampletoken1234567890', '2025-04-22 11:00:00'),
(3, 9, '8ada8cd0d7d1eea5d19c4995de28c096b544d9b9ebd8b4cf1d8793636fb73e9f', '2025-05-06 03:16:46');
INSERT INTO `Reviews` (`ReviewID`, `UserID`, `ProductID`, `Rating`, `Comment`) VALUES
(4, 5, 2, 5, 'Sản phẩm rất ngon!!!!!!!!!!!'),
(5, 5, 3, 5, '123'),
(6, 5, 3, 5, 'ngon'),
(7, 5, 3, 5, 'ngon'),
(8, 5, 3, 4, '123'),
(9, 5, 3, 5, 'tuyet'),
(10, 5, 1, 2, 'tam'),
(11, 5, 9, 5, 'asd');
INSERT INTO `Roles` (`RoleID`, `RoleName`, `Description`) VALUES
(1, 'admin', 'Quản trị viên hệ thống'),
(2, 'user', 'Người dùng thông thường');
INSERT INTO `TempOrderItems` (`TempID`, `OrderID`, `ProductID`, `Quantity`) VALUES
(5, 20, 1, 50),
(6, 20, 2, 30),
(9, 47, 3, 16),
(10, 47, 2, 1),
(11, 47, 7, 1),
(12, 47, 8, 26),
(28, 54, 3, 1),
(29, 54, 2, 1),
(31, 56, 3, 1),
(32, 57, 3, 1),
(34, 59, 13, 1),
(35, 60, 3, 1),
(36, 61, 2, 1),
(45, 70, 2, 1),
(48, 72, 2, 1);
INSERT INTO `UserRedemptionLimits` (`UserID`, `VoucherID`, `RedemptionCount`) VALUES
(5, 1, 1),
(5, 3, 1),
(5, 5, 0),
(9, 1, 2),
(9, 2, 1),
(9, 4, 1);
INSERT INTO `Users` (`UserID`, `RoleID`, `FullName`, `Email`, `Password`, `Phone`, `Address`) VALUES
(1, 1, 'Admin User', 'admin@example.com', '$2a$10$zX8k8g7f8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p', '0901234567', '123 Đường Vĩnh Lộc, TP.HCM'),
(2, 2, 'John Doe', 'user1@example.com', '$2a$10$zX8k8g7f8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p', '0908765432', '456 Đường Lê Lợi, TP.HCM'),
(3, 2, 'Jane Smith', 'user2@example.com', '$2a$10$zX8k8g7f8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p5mX8Qz7p', '0912345678', '789 Đường Nguyễn Huệ, TP.HCM'),
(4, 1, 'admin', 'admin@gmail.com', '$2b$10$7UUmYIuX5GpHYIDvV0Ss9urLnhFz/Iz9zVVLXMnlnBC8IasrBDzCW', '123456789', 'HCM'),
(5, 2, 'testasd', 'test@gmail.com', '$2b$10$vFFncs49jjvE8yKbnFoQ6Orgs8nN7ObVjdbNR2Ri05XUUY94uVjie', '123456789', 'HCM'),
(6, 2, 'nguoidung', 'nguoidung@gmail.com', '$2b$10$vGOIO91SdG6xiEML1HDNfuNbecjzjNxOjZMYMz44C4EzOD8bZ5F0u', '123456789', 'HCM'),
(7, 2, 'Nguyen Van Updated', 'nguoidung1@gmail.com', '$2b$10$7UUmYIuX5GpHYIDvV0Ss9urLnhFz/Iz9zVVLXMnlnBC8IasrBDzCW', '123456087', 'HCM'),
(8, 2, 'duccccc', 'duckute395@gmail.com', '$2b$10$M0vNXzG.AboxeZrQ9b5C9u4wOzeOitgGVSa8QMbs6n/mkILRo4zyG', '123456789', 'asdasd'),
(9, 2, 'Nguyen Phuc Hau', 'haajuuu8@gmail.com', '$2b$10$/wvxp1InY9AWZEj/2eqbuuKsVnJa9PR4p96CrnSHFSq5Y1Z82bBb6', '123456789', 'Khu Công nghệ cao Xa lộ Hà Nội, Hiệp Phú, Thủ Đức,');
INSERT INTO `UserVouchers` (`UserVoucherID`, `UserID`, `VoucherID`, `Code`, `Status`, `UsageCount`, `ExpiryDate`) VALUES
(1, 9, 1, 'V7ODP5', 'used', 2, '2025-06-06 01:51:30'),
(2, 9, 5, '6F0ENZ', 'active', 0, '2025-06-06 02:21:39'),
(20, 9, 4, '4NF9HH', 'active', 0, '2025-06-06 03:37:15'),
(21, 5, 1, 'RUIEA3', 'active', 0, '2025-06-06 03:37:38'),
(22, 5, 3, 'LZOUHP', 'active', 0, '2025-06-06 03:37:40'),
(23, 9, 2, '5JKDWC', 'active', 0, '2025-06-06 04:25:53');
INSERT INTO `Vouchers` (`VoucherID`, `Name`, `DiscountValue`, `PointsRequired`, `UsageLimit`, `ExpiryDays`, `RedemptionLimit`, `MinOrderValue`) VALUES
(1, 'Giảm 10,000 VND', '10000.00', 5, 2, 30, 2, '50000.00'),
(2, 'Giảm 20,000 VND', '20000.00', 10, 2, 30, 2, '100000.00'),
(3, 'Giảm 50,000 VND', '50000.00', 20, 1, 30, 1, '0.00'),
(4, 'Giảm 100,000 VND', '100000.00', 40, 1, 30, 1, '0.00'),
(5, 'Giảm 10%', '10.00', 15, 3, 30, 3, '0.00');
INSERT INTO `Wishlists` (`WishlistID`, `UserID`, `ProductID`) VALUES
(4, 5, 2),
(5, 5, 3),
(6, 5, 4),
(7, 5, 5),
(8, 5, 7);


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;