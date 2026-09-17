-- ============================================================
-- Migration: Add stock_movements audit table
-- Run once against your database.
-- Safe to re-run (uses CREATE TABLE IF NOT EXISTS).
-- ============================================================

USE `evergreen_emporium`;

CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id`          INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `product_id`  INT UNSIGNED  NOT NULL,
  `delta`       INT           NOT NULL COMMENT 'Positive = stock in, negative = stock out',
  `stock_after` INT           NOT NULL COMMENT 'Stock level after this movement',
  `reason`      ENUM(
                  'order_placed',
                  'order_cancelled',
                  'manual_adjustment',
                  'product_created'
                )             NOT NULL DEFAULT 'manual_adjustment',
  `reference_id` INT UNSIGNED NULL     COMMENT 'order_id for order events, NULL for manual',
  `notes`       VARCHAR(300)  NULL,
  `admin_id`    INT UNSIGNED  NULL     COMMENT 'Set for manual admin adjustments',
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sm_product`   (`product_id`),
  KEY `idx_sm_reason`    (`reason`),
  KEY `idx_sm_reference` (`reference_id`),
  KEY `idx_sm_created`   (`created_at`),
  CONSTRAINT `fk_sm_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
