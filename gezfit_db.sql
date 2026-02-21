-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 31, 2025 at 06:18 AM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gezfit_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(100) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_address` text NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_status` varchar(50) DEFAULT 'paid',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_id` (`order_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` varchar(100) NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `price`, `category`, `image_url`, `created_at`) VALUES
(1, 'Nike Air Max 270', 'Comfortable running shoes with Air Max technology', 150.00, 'footwear', 'images/Nike Air Max 270.webp', '2025-10-17 08:08:49'),
(2, 'Adidas Ultraboost 22', 'High-performance running shoes with Boost technology', 180.00, 'footwear', 'images/Adidas Ultraboost 22.webp', '2025-10-17 08:08:49'),
(3, 'Levi\'s 501 Jeans', 'Classic straight fit jeans', 89.99, 'men', 'images/levis_501.jpg', '2025-10-17 08:08:49'),
(4, 'H&M Cotton T-Shirt', 'Basic cotton t-shirt in various colors', 19.99, 'men', 'images/holo S.webp', '2025-10-17 08:08:49'),
(5, 'Zara Summer Dress', 'Light summer dress perfect for casual outings', 49.99, 'women', 'images/zara_dress.jpg', '2025-10-17 08:08:49'),
(6, 'Forever 21 Skirt', 'Trendy mini skirt for young fashionistas', 29.99, 'women', 'images/forever21_skirt.jpg', '2025-10-17 08:08:49'),
(7, 'Puma Sneakers', 'Stylish sneakers for everyday wear', 120.00, 'footwear', 'images/puma_sneakers.jpg', '2025-10-17 08:08:49'),
(8, 'Uniqlo Hoodie', 'Comfortable hoodie for casual wear', 39.99, 'men', 'images/uniqlo_hoodie.jpg', '2025-10-17 08:08:49'),
(9, 'H&M Denim Jacket', 'Classic denim jacket', 79.99, 'women', 'images/hm_denim_jacket.jpg', '2025-10-17 08:08:49'),
(10, 'Converse Chuck Taylor', 'Iconic high-top sneakers', 65.00, 'footwear', 'images/converse_chuck.jpg', '2025-10-17 08:08:49'),
(11, 'Nike Sportswear Hoodie', 'Athletic hoodie with Nike branding', 85.00, 'men', 'images/nike_hoodie.jpg', '2025-10-17 08:08:49'),
(12, 'Adidas Originals Track Pants', 'Comfortable track pants for sports', 55.00, 'men', 'images/adidas_trackpants.jpg', '2025-10-17 08:08:49'),
(13, 'Shein Crop Top', 'Trendy crop top for summer', 15.99, 'women', 'images/shein_croptop.jpg', '2025-10-17 08:08:49'),
(14, 'ASOS High-Waisted Jeans', 'Fashionable high-waisted jeans', 45.00, 'women', 'images/asos_jeans.jpg', '2025-10-17 08:08:49'),
(15, 'New Balance 574', 'Classic sneakers with retro design', 95.00, 'footwear', 'images/newbalance_574.jpg', '2025-10-17 08:08:49'),
(16, 'Gap Kids T-Shirt', 'Comfortable t-shirt for kids', 12.99, 'kids', 'images/gap_kids_tshirt.jpg', '2025-10-17 08:08:49'),
(17, 'Carter\'s Baby Onesie', 'Soft onesie for babies', 9.99, 'kids', 'images/carters_onesie.jpg', '2025-10-17 08:08:49'),
(18, 'Old Navy Kids Shorts', 'Casual shorts for active kids', 14.99, 'kids', 'images/oldnavy_shorts.jpg', '2025-10-17 08:08:49'),
(19, 'Bath & Body Works Body Mist', 'Refreshing body mist', 12.99, 'home_beauty', 'images/bbw_bodymist.jpg', '2025-10-17 08:08:49'),
(20, 'The Body Shop Face Cream', 'Moisturizing face cream', 25.00, 'home_beauty', 'images/bodyshop_cream.jpg', '2025-10-17 08:08:49'),
(21, 'Candle Lite Scented Candle', 'Aromatic scented candle', 18.99, 'home_beauty', 'images/candlelite_candle.jpg', '2025-10-17 08:08:49'),
(22, 'Genz Phone Case', 'Trendy phone case with Gen Z vibes', 22.99, 'genz', 'images/genz_phonecase.jpg', '2025-10-17 08:08:49'),
(23, 'Vintage Sunglasses', 'Retro-style sunglasses', 35.00, 'genz', 'images/vintage_sunglasses.jpg', '2025-10-17 08:08:49'),
(24, 'Wireless Earbuds', 'High-quality wireless earbuds', 79.99, 'genz', 'images/wireless_earbuds.jpg', '2025-10-17 08:08:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `otp` varchar(6) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `email`, `mobile`, `password`, `otp`, `is_admin`, `created_at`) VALUES
(3, 'ankit1012', 'ankit1012', 'uankit070@gmail.com', '7666380081', '$2y$10$bujykxCU0Ca5M5Waw.ww8ewejsmyxGy3lm4xJ5i7Kf9LqC4UHDp9W', NULL, 0, '2025-10-17 08:20:20'),
(2, 'Admin', 'admin', 'admin@gezfit.com', '0987654321', '$2y$10$bujykxCU0Ca5M5Waw.ww8ewejsmyxGy3lm4xJ5i7Kf9LqC4UHDp9W', NULL, 1, '2025-10-17 08:08:49'),
(4, 'vivek', 'vivek', 'vivek@gmail.com', '4562317850', '$2y$10$Ut2CwcVs7vlzyKmD08zohOIfdVPVMliKyNDvjxAtbWm745P2HDijC', NULL, 0, '2025-10-17 08:22:29'),
(5, 'ankit', 'ankit', 'ankit767@gmail.com', '7666380082', '$2y$10$whOEYlLRlL3/9N3OdBYKYeM40OBCsuaVcxpvW7Uy11O9iAGUaPtGO', NULL, 0, '2025-10-31 05:30:43');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
