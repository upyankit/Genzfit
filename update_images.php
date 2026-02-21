<?php
require_once 'api/config.php';

try {
    // Update image URLs in database to match actual files
    $updates = [
        ['name' => 'Nike Air Max 270', 'image_url' => 'images/Nike Air Max 270.webp'],
        ['name' => 'Adidas Ultraboost 22', 'image_url' => 'images/Adidas Ultraboost 22.webp'],
        ['name' => 'H&M Cotton T-Shirt', 'image_url' => 'images/holo S.webp'],
        // Add more if needed
    ];

    foreach ($updates as $update) {
        $stmt = $pdo->prepare("UPDATE products SET image_url = ? WHERE name = ?");
        $stmt->execute([$update['image_url'], $update['name']]);
        echo "Updated {$update['name']} to {$update['image_url']}<br>";
    }

    echo "Database updates completed successfully.";
} catch (PDOException $e) {
    echo "Error updating database: " . $e->getMessage();
}
?>
