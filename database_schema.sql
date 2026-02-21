-- GenzFit Database Schema and Sample Data

-- Create database
CREATE DATABASE IF NOT EXISTS gezfit_db;
USE gezfit_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile VARCHAR(15),
    password VARCHAR(255) NOT NULL,
    otp VARCHAR(6) DEFAULT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Sample products data
INSERT INTO products (name, description, price, category, image_url) VALUES
('Nike Air Max 270', 'Comfortable running shoes with Air Max technology', 150.00, 'footwear', 'images/nike_air_max.jpg'),
('Adidas Ultraboost 22', 'High-performance running shoes with Boost technology', 180.00, 'footwear', 'images/adidas_ultraboost.jpg'),
('Levi\'s 501 Jeans', 'Classic straight fit jeans', 89.99, 'men', 'images/levis_501.jpg'),
('H&M Cotton T-Shirt', 'Basic cotton t-shirt in various colors', 19.99, 'men', 'images/hm_tshirt.jpg'),
('Zara Summer Dress', 'Light summer dress perfect for casual outings', 49.99, 'women', 'images/zara_dress.jpg'),
('Forever 21 Skirt', 'Trendy mini skirt for young fashionistas', 29.99, 'women', 'images/forever21_skirt.jpg'),
('Puma Sneakers', 'Stylish sneakers for everyday wear', 120.00, 'footwear', 'images/puma_sneakers.jpg'),
('Uniqlo Hoodie', 'Comfortable hoodie for casual wear', 39.99, 'men', 'images/uniqlo_hoodie.jpg'),
('H&M Denim Jacket', 'Classic denim jacket', 79.99, 'women', 'images/hm_denim_jacket.jpg'),
('Converse Chuck Taylor', 'Iconic high-top sneakers', 65.00, 'footwear', 'images/converse_chuck.jpg'),
('Nike Sportswear Hoodie', 'Athletic hoodie with Nike branding', 85.00, 'men', 'images/nike_hoodie.jpg'),
('Adidas Originals Track Pants', 'Comfortable track pants for sports', 55.00, 'men', 'images/adidas_trackpants.jpg'),
('Shein Crop Top', 'Trendy crop top for summer', 15.99, 'women', 'images/shein_croptop.jpg'),
('ASOS High-Waisted Jeans', 'Fashionable high-waisted jeans', 45.00, 'women', 'images/asos_jeans.jpg'),
('New Balance 574', 'Classic sneakers with retro design', 95.00, 'footwear', 'images/newbalance_574.jpg'),
('Gap Kids T-Shirt', 'Comfortable t-shirt for kids', 12.99, 'kids', 'images/gap_kids_tshirt.jpg'),
('Carter\'s Baby Onesie', 'Soft onesie for babies', 9.99, 'kids', 'images/carters_onesie.jpg'),
('Old Navy Kids Shorts', 'Casual shorts for active kids', 14.99, 'kids', 'images/oldnavy_shorts.jpg'),
('Bath & Body Works Body Mist', 'Refreshing body mist', 12.99, 'home_beauty', 'images/bbw_bodymist.jpg'),
('The Body Shop Face Cream', 'Moisturizing face cream', 25.00, 'home_beauty', 'images/bodyshop_cream.jpg'),
('Candle Lite Scented Candle', 'Aromatic scented candle', 18.99, 'home_beauty', 'images/candlelite_candle.jpg'),
('Genz Phone Case', 'Trendy phone case with Gen Z vibes', 22.99, 'genz', 'images/genz_phonecase.jpg'),
('Vintage Sunglasses', 'Retro-style sunglasses', 35.00, 'genz', 'images/vintage_sunglasses.jpg'),
('Wireless Earbuds', 'High-quality wireless earbuds', 79.99, 'genz', 'images/wireless_earbuds.jpg');

-- Sample user (for testing)
INSERT INTO users (name, username, email, mobile, password) VALUES
('Test User', 'testuser', 'test@example.com', '1234567890', '$2y$10$examplehashedpassword'); -- Replace with actual hashed password

-- Sample admin user (for testing)
INSERT INTO users (name, username, email, mobile, password, is_admin) VALUES
('Admin User', 'admin', 'admin@gezfit.com', '0987654321', '$2y$10$adminhashedpassword', TRUE); -- Replace with actual hashed password
