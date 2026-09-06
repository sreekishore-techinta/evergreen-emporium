-- ============================================================
-- Evergreen Media Ecommerce — MySQL Database Schema
-- Engine: InnoDB | Charset: utf8mb4_unicode_ci
-- Run this once to create all tables.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET time_zone = '+05:30';

CREATE DATABASE IF NOT EXISTS `evergreen_emporium`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `evergreen_emporium`;

-- ------------------------------------------------------------
-- 1. admins
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admins` (
  `id`            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(120)      NOT NULL,
  `email`         VARCHAR(180)      NOT NULL,
  `password_hash` VARCHAR(255)      NOT NULL,
  `role`          ENUM('superadmin','admin','editor') NOT NULL DEFAULT 'admin',
  `is_active`     TINYINT(1)        NOT NULL DEFAULT 1,
  `last_login_at` DATETIME          NULL,
  `created_at`    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`    DATETIME          NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_admins_email` (`email`),
  KEY `idx_admins_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 2. users (customers)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`            VARCHAR(120)  NOT NULL,
  `email`           VARCHAR(180)  NOT NULL,
  `password_hash`   VARCHAR(255)  NOT NULL,
  `phone`           VARCHAR(20)   NULL,
  `is_active`       TINYINT(1)    NOT NULL DEFAULT 1,
  `email_verified`  TINYINT(1)    NOT NULL DEFAULT 0,
  `verify_token`    VARCHAR(100)  NULL,
  `reset_token`     VARCHAR(100)  NULL,
  `reset_expires`   DATETIME      NULL,
  `last_login_at`   DATETIME      NULL,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_active` (`is_active`),
  KEY `idx_users_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 3. categories
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `categories` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`        VARCHAR(120)  NOT NULL,
  `slug`        VARCHAR(140)  NOT NULL,
  `description` TEXT          NULL,
  `image`       VARCHAR(300)  NULL,
  `sort_order`  INT           NOT NULL DEFAULT 0,
  `is_active`   TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_slug` (`slug`),
  KEY `idx_categories_active` (`is_active`),
  KEY `idx_categories_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 4. products
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `products` (
  `id`               INT UNSIGNED       NOT NULL AUTO_INCREMENT,
  `category_id`      INT UNSIGNED       NOT NULL,
  `name`             VARCHAR(200)       NOT NULL,
  `slug`             VARCHAR(220)       NOT NULL,
  `sku`              VARCHAR(60)        NOT NULL,
  `tagline`          VARCHAR(300)       NULL,
  `description`      TEXT               NULL,
  `long_description` LONGTEXT           NULL,
  `benefits`         JSON               NULL  COMMENT 'Array of benefit strings',
  `usage_info`       TEXT               NULL,
  `type`             VARCHAR(120)       NULL,
  `badge`            VARCHAR(60)        NULL  COMMENT 'e.g. Premium Quality, Export Quality',
  `price`            DECIMAL(10,2)      NOT NULL DEFAULT 0.00,
  `discount_price`   DECIMAL(10,2)      NULL,
  `stock`            INT                NOT NULL DEFAULT 0,
  `low_stock_alert`  INT                NOT NULL DEFAULT 5,
  `weight`           VARCHAR(60)        NULL,
  `primary_image`    VARCHAR(300)       NULL,
  `rating`           DECIMAL(3,2)       NOT NULL DEFAULT 0.00,
  `rating_count`     INT                NOT NULL DEFAULT 0,
  `is_active`        TINYINT(1)         NOT NULL DEFAULT 1,
  `is_featured`      TINYINT(1)         NOT NULL DEFAULT 0,
  `is_bestseller`    TINYINT(1)         NOT NULL DEFAULT 0,
  `applications`     JSON               NULL  COMMENT 'Array of application strings',
  `sort_order`       INT                NOT NULL DEFAULT 0,
  `created_at`       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_slug` (`slug`),
  UNIQUE KEY `uq_products_sku`  (`sku`),
  KEY `idx_products_category`   (`category_id`),
  KEY `idx_products_active`     (`is_active`),
  KEY `idx_products_featured`   (`is_featured`),
  KEY `idx_products_bestseller` (`is_bestseller`),
  KEY `idx_products_stock`      (`stock`),
  KEY `idx_products_price`      (`price`),
  CONSTRAINT `fk_products_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 5. product_images
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `product_images` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_id`  INT UNSIGNED  NOT NULL,
  `image_path`  VARCHAR(300)  NOT NULL,
  `alt_text`    VARCHAR(200)  NULL,
  `is_primary`  TINYINT(1)    NOT NULL DEFAULT 0,
  `sort_order`  INT           NOT NULL DEFAULT 0,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pimages_product` (`product_id`),
  KEY `idx_pimages_primary` (`is_primary`),
  CONSTRAINT `fk_pimages_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 6. addresses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `addresses` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`      INT UNSIGNED  NOT NULL,
  `label`        VARCHAR(60)   NULL DEFAULT 'Home',
  `name`         VARCHAR(120)  NOT NULL,
  `phone`        VARCHAR(20)   NOT NULL,
  `line1`        VARCHAR(255)  NOT NULL,
  `line2`        VARCHAR(255)  NULL,
  `city`         VARCHAR(100)  NOT NULL,
  `state`        VARCHAR(100)  NOT NULL,
  `pincode`      VARCHAR(12)   NOT NULL,
  `country`      VARCHAR(80)   NOT NULL DEFAULT 'India',
  `is_default`   TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 7. cart
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED  NULL COMMENT 'NULL = guest (session-based)',
  `session_id`  VARCHAR(80)   NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cart_user`    (`user_id`),
  KEY `idx_cart_session` (`session_id`),
  CONSTRAINT `fk_cart_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 8. cart_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `cart_id`     INT UNSIGNED  NOT NULL,
  `product_id`  INT UNSIGNED  NOT NULL,
  `quantity`    INT           NOT NULL DEFAULT 1,
  `price_snapshot` DECIMAL(10,2) NOT NULL COMMENT 'Price at add-to-cart time',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cart_product` (`cart_id`, `product_id`),
  KEY `idx_ci_cart`    (`cart_id`),
  KEY `idx_ci_product` (`product_id`),
  CONSTRAINT `fk_ci_cart`
    FOREIGN KEY (`cart_id`) REFERENCES `cart` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ci_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 9. wishlist
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wishlist` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `user_id`     INT UNSIGNED  NOT NULL,
  `product_id`  INT UNSIGNED  NOT NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_wishlist` (`user_id`, `product_id`),
  KEY `idx_wishlist_user`    (`user_id`),
  KEY `idx_wishlist_product` (`product_id`),
  CONSTRAINT `fk_wishlist_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_wishlist_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 10. coupons
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `coupons` (
  `id`              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `code`            VARCHAR(30)   NOT NULL,
  `type`            ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  `value`           DECIMAL(10,2) NOT NULL,
  `min_order`       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `max_discount`    DECIMAL(10,2) NULL,
  `usage_limit`     INT           NULL COMMENT 'NULL = unlimited',
  `used_count`      INT           NOT NULL DEFAULT 0,
  `starts_at`       DATETIME      NULL,
  `expires_at`      DATETIME      NULL,
  `is_active`       TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_coupons_code` (`code`),
  KEY `idx_coupons_active` (`is_active`),
  KEY `idx_coupons_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 11. orders
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id`               INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `order_number`     VARCHAR(30)    NOT NULL,
  `user_id`          INT UNSIGNED   NULL COMMENT 'NULL = guest checkout',
  `status`           ENUM('pending','confirmed','processing','shipped','delivered','cancelled')
                                    NOT NULL DEFAULT 'pending',
  `subtotal`         DECIMAL(10,2)  NOT NULL,
  `shipping_charge`  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `discount_amount`  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  `grand_total`      DECIMAL(10,2)  NOT NULL,
  `coupon_id`        INT UNSIGNED   NULL,
  `coupon_code`      VARCHAR(30)    NULL,
  `payment_status`   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `payment_method`   VARCHAR(60)    NULL,
  -- Shipping address snapshot (denormalized for order integrity)
  `ship_name`        VARCHAR(120)   NOT NULL,
  `ship_phone`       VARCHAR(20)    NOT NULL,
  `ship_line1`       VARCHAR(255)   NOT NULL,
  `ship_line2`       VARCHAR(255)   NULL,
  `ship_city`        VARCHAR(100)   NOT NULL,
  `ship_state`       VARCHAR(100)   NOT NULL,
  `ship_pincode`     VARCHAR(12)    NOT NULL,
  `ship_country`     VARCHAR(80)    NOT NULL DEFAULT 'India',
  `notes`            TEXT           NULL,
  `created_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_orders_number` (`order_number`),
  KEY `idx_orders_user`    (`user_id`),
  KEY `idx_orders_status`  (`status`),
  KEY `idx_orders_payment` (`payment_status`),
  KEY `idx_orders_created` (`created_at`),
  CONSTRAINT `fk_orders_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_coupon`
    FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 12. order_items
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`           INT UNSIGNED   NOT NULL AUTO_INCREMENT,
  `order_id`     INT UNSIGNED   NOT NULL,
  `product_id`   INT UNSIGNED   NULL COMMENT 'NULL if product deleted later',
  `product_name` VARCHAR(200)   NOT NULL COMMENT 'Snapshot at purchase',
  `product_sku`  VARCHAR(60)    NOT NULL COMMENT 'Snapshot at purchase',
  `product_image`VARCHAR(300)   NULL,
  `quantity`     INT            NOT NULL,
  `unit_price`   DECIMAL(10,2)  NOT NULL COMMENT 'Price at purchase — never recalculated',
  `line_total`   DECIMAL(10,2)  NOT NULL,
  `created_at`   DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_oi_order`   (`order_id`),
  KEY `idx_oi_product` (`product_id`),
  CONSTRAINT `fk_oi_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_oi_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 13. payments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `payments` (
  `id`             INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `order_id`       INT UNSIGNED  NOT NULL,
  `amount`         DECIMAL(10,2) NOT NULL,
  `method`         VARCHAR(60)   NOT NULL COMMENT 'razorpay, cod, upi, etc.',
  `status`         ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  `transaction_id` VARCHAR(120)  NULL COMMENT 'Gateway transaction ID',
  `gateway_data`   JSON          NULL COMMENT 'Full gateway response for audit',
  `verified_at`    DATETIME      NULL,
  `created_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_order`  (`order_id`),
  KEY `idx_payments_status` (`status`),
  KEY `idx_payments_txn`    (`transaction_id`),
  CONSTRAINT `fk_payments_order`
    FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 14. reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `reviews` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_id`  INT UNSIGNED  NOT NULL,
  `user_id`     INT UNSIGNED  NOT NULL,
  `order_id`    INT UNSIGNED  NULL COMMENT 'Verified purchase link',
  `rating`      TINYINT       NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `title`       VARCHAR(200)  NULL,
  `body`        TEXT          NULL,
  `status`      ENUM('pending','approved','hidden') NOT NULL DEFAULT 'pending',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review_user_product` (`user_id`, `product_id`),
  KEY `idx_reviews_product` (`product_id`),
  KEY `idx_reviews_status`  (`status`),
  CONSTRAINT `fk_reviews_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reviews_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 15. contact_messages
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`         INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(120)  NOT NULL,
  `email`      VARCHAR(180)  NOT NULL,
  `phone`      VARCHAR(20)   NULL,
  `subject`    VARCHAR(200)  NULL,
  `message`    TEXT          NOT NULL,
  `is_read`    TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contact_read` (`is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 16. newsletter_subscribers
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `email`       VARCHAR(180)  NOT NULL,
  `is_active`   TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_newsletter_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 17. site_settings
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(80)   NOT NULL,
  `value`       TEXT          NULL,
  `type`        ENUM('text','number','boolean','json','image') NOT NULL DEFAULT 'text',
  `label`       VARCHAR(120)  NULL,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_settings_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- 18. admin_sessions (secure server-side session tracking)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_sessions` (
  `id`           INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `admin_id`     INT UNSIGNED  NOT NULL,
  `token_hash`   VARCHAR(255)  NOT NULL,
  `ip_address`   VARCHAR(45)   NULL,
  `user_agent`   VARCHAR(300)  NULL,
  `expires_at`   DATETIME      NOT NULL,
  `created_at`   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_asessions_admin`  (`admin_id`),
  KEY `idx_asessions_token`  (`token_hash`(20)),
  KEY `idx_asessions_exp`    (`expires_at`),
  CONSTRAINT `fk_asessions_admin`
    FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
