-- ============================================================
-- Evergreen Media — Seed Data
-- Run AFTER schema.sql
-- Admin password: Admin@2026  (bcrypt hash below)
-- ============================================================

USE `evergreen_emporium`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- Admin user
-- Password: Admin@2026
-- Hash generated with: password_hash('Admin@2026', PASSWORD_BCRYPT, ['cost'=>12])
-- CHANGE THIS PASSWORD IMMEDIATELY after first login.
-- ------------------------------------------------------------
INSERT IGNORE INTO `admins` (`id`,`name`,`email`,`password_hash`,`role`,`is_active`) VALUES
(1,
 'Evergreen Admin',
 'admin@evergreenmedia.in',
 '$2y$12$TJbEKdcFZ3TqaJxZ6xFUaO5Q0E1c6EaY3nH1P2MhIAMvDKB3KYVTC',
 'superadmin',
 1
);

-- ------------------------------------------------------------
-- Categories (3 real categories)
-- ------------------------------------------------------------
INSERT IGNORE INTO `categories` (`id`,`name`,`slug`,`description`,`sort_order`,`is_active`) VALUES
(1,
 'Bio & Microbial Solutions',
 'bio-microbial-solutions',
 'Live microbial cultures, mycorrhizal inoculants and biofungicides that work with the soil food web to build resilient root zones and protect plants naturally.',
 1, 1),
(2,
 'Organic Fertilizers & Plant Nutrition',
 'organic-fertilizers-plant-nutrition',
 'Slow-release organic fertilisers, liquid manures and botanical inputs that nourish plants through every stage — from seedling to harvest.',
 2, 1),
(3,
 'Growing Media',
 'growing-media',
 'Premium root substrates — export-quality cocopeat and an 18-in-1 potting mix — engineered for superior aeration, water retention and healthy root development.',
 3, 1);

-- ------------------------------------------------------------
-- Products — 12 real products from PDF
-- ------------------------------------------------------------

-- 1. Pseudomonas
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  1, 1,
  'Pseudomonas',
  'pseudomonas',
  'EM-BIO-001',
  'Protects roots, improves soil health, enhances nutrient absorption.',
  'Microbial Biofertilizer',
  'Premium Quality',
  'A premium microbial culture that protects roots from harmful pathogens, improves soil health, enhances nutrient absorption and promotes stronger, healthier plant growth.',
  'Our Premium Quality Pseudomonas is a carefully selected microbial culture that works at the root zone to defend against soil-borne pathogens while simultaneously improving phosphorus availability. Use as part of a consistent soil-care routine for home gardens, nurseries and vegetable crops.',
  '["Promotes strong root growth","Improves phosphorus availability","100% natural & organic","Protects against soil-borne pathogens","Ready to use"]',
  'Mix with soil or water and apply directly to the root zone. Use at transplanting or as a soil drench. Refer to pack label for dosage.',
  '["Home Gardening","Nurseries","Vegetable Crops","Organic Farming"]',
  499.00, 50, '1 kg', 4.90, 0, 1, 1, 1, 1
);

-- 2. VAM
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  2, 1,
  'VAM',
  'vam',
  'EM-BIO-002',
  'Vesicular Arbuscular Mycorrhiza — powerful root booster for healthy plant growth.',
  'Mycorrhizal Biofertilizer',
  'Premium Quality',
  'VAM (Vesicular Arbuscular Mycorrhiza) forms a beneficial partnership with plant roots, improving nutrient and water uptake, promoting vigorous root growth and increasing crop yield.',
  'A natural biofertilizer that extends the root system reach through symbiotic fungal networks. VAM improves phosphorus, zinc, copper and iron absorption, enhances drought tolerance, and protects roots from soil-borne pathogens. Suitable for all crops.',
  '["Promotes extensive root development","Enhances phosphorus availability and absorption","Improves uptake of Zn, Cu, Fe and other micronutrients","Improves water absorption and drought tolerance","Protects roots from soil-borne pathogens","Enhances flowering, fruiting and crop productivity","Suitable for all crops"]',
  'Apply close to the root zone at the time of sowing or transplanting. Follow dosage on pack label.',
  '["Nurseries","Fruit Crops","Commercial Agriculture","Vegetable Crops"]',
  599.00, 40, '1 kg', 4.80, 0, 1, 1, 0, 2
);

-- 3. Azospirillum
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  3, 1,
  'Azospirillum',
  'azospirillum',
  'EM-BIO-003',
  'Natural nitrogen fixation for stronger, greener and more productive plants.',
  'Nitrogen-Fixing Biofertilizer',
  'Premium Quality',
  'A premium Azospirillum biofertilizer that improves soil fertility through natural nitrogen fixation, promotes healthy root development and supports stronger, greener and more productive plants.',
  'Azospirillum is a free-living nitrogen-fixing bacterium that colonises the root zone and makes atmospheric nitrogen available to plants naturally. It also produces growth-promoting hormones that stimulate root elongation and improve nutrient uptake.',
  '["Natural nitrogen fixer","Improves soil fertility","100% natural & organic","Promotes healthy root growth","Ready to use"]',
  'Apply as a soil drench or mix into the root zone at planting. Follow dosage guidelines on pack.',
  '["Vegetable Crops","Organic Farming","Commercial Agriculture","Home Gardening"]',
  449.00, 45, '1 kg', 4.70, 0, 1, 0, 0, 3
);

-- 4. PASPO Bacteria
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  4, 1,
  'PASPO Bacteria',
  'paspo-bacteria',
  'EM-BIO-004',
  'Unlocks soil phosphorus for stronger roots and better growth.',
  'Phosphate-Solubilising Biofertilizer',
  'Premium Quality',
  'A premium Phosphobacteria that naturally unlocks phosphorus in the soil, enhances nutrient uptake, promotes strong root development and supports healthier, more productive plants.',
  'PASPO Bacteria (Phosphate-Solubilising Bacteria) converts insoluble phosphorus in the soil into a plant-available form, dramatically improving phosphorus efficiency. This eco-friendly biofertilizer promotes stronger root systems.',
  '["Promotes strong root growth","Improves phosphorus availability","100% natural & organic","Eco-friendly biofertilizer","Ready to use"]',
  'Mix with soil or apply as a soil drench near the root zone. Refer to pack label for dosage and timing.',
  '["Vegetable Crops","Fruit Crops","Organic Farming","Nurseries"]',
  449.00, 45, '1 kg', 4.70, 0, 1, 0, 0, 4
);

-- 5. Trichoderma
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  5, 1,
  'Trichoderma',
  'trichoderma',
  'EM-BIO-005',
  'Eco-friendly biofungicide that protects roots from soil-borne fungi.',
  'Biofungicide / Soil Health',
  'Premium Quality',
  'A premium Trichoderma product that improves soil health, protects roots from harmful fungi, promotes strong root development and supports healthier, more productive plants.',
  'Trichoderma is a naturally occurring beneficial fungus that colonises the root zone and actively outcompetes harmful soil-borne pathogens including Fusarium, Pythium and Rhizoctonia. It also enhances soil microbial activity and improves plant health.',
  '["Enhances soil microbial activity","Improves plant health","100% natural & organic","Protects against soil-borne fungi","Eco-friendly biofungicide"]',
  'Mix into soil at the time of planting or apply as a drench. Can also be used as a seed treatment. Refer to pack label for dosage.',
  '["Nurseries","Vegetable Crops","Organic Farming","Commercial Agriculture"]',
  499.00, 40, '1 kg', 4.80, 0, 1, 0, 0, 5
);

-- 6. Vermi Compost
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  6, 2,
  'Vermi Compost',
  'vermi-compost',
  'EM-ORG-001',
  'Enriches soil with essential nutrients for thriving plants.',
  'Organic Soil Conditioner',
  'Premium Quality',
  'A premium organic soil enhancer that enriches the soil with essential nutrients, improves aeration and supports healthy root development for thriving plants.',
  'Our premium Vermicompost is produced from carefully managed worm-casting processes, resulting in a dark, nutrient-rich organic conditioner. It improves soil structure, water retention, aeration and biological activity.',
  '["Improves soil fertility","Rich in essential nutrients","100% natural & organic","Promotes strong root growth","Ready to use"]',
  'Mix into soil or growing media at a ratio of 20-30%. Apply as a top dressing or incorporate before planting. Suitable for all crops.',
  '["Home Gardening","Terrace Gardening","Organic Farming","Flowering Plants"]',
  399.00, 60, '5 kg', 4.90, 0, 1, 1, 1, 6
);

-- 7. Bone Meal Powder
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  7, 2,
  'Bone Meal Powder',
  'bone-meal-powder',
  'EM-ORG-002',
  'Rich in NPK & micronutrients for vigorous flowering and fruiting.',
  'Organic Plant Nutrition',
  'Premium Quality',
  'A premium Bone Meal Powder that enriches the soil with essential nutrients, promotes vigorous root growth, enhances flowering and supports healthier, stronger plants.',
  'Our Bone Meal Powder is a slow-release organic fertiliser rich in nitrogen, phosphorus, potassium and micronutrients. It provides a steady supply of nutrients over the growing season.',
  '["Rich in NPK & micronutrients","Rich in essential nutrients","100% natural & organic","Promotes strong root growth","Ready to use"]',
  'Work into soil before planting or apply as a top dressing. Use in moderation alongside a balanced growing programme.',
  '["Flowering Plants","Fruit Crops","Terrace Gardening","Home Gardening"]',
  299.00, 70, '2 kg', 4.80, 0, 1, 0, 1, 7
);

-- 8. Neem Cake Powder
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  8, 2,
  'Neem Cake Powder',
  'neem-cake-powder',
  'EM-ORG-003',
  'Natural fertiliser and pest repellent for healthier, stronger plants.',
  'Botanical Soil Input & Pest Repellent',
  'Premium Quality',
  'A premium Neem Cake Powder that improves soil fertility, nourishes plants with essential nutrients, protects roots from soil pests and supports healthier, stronger plant growth.',
  'Neem Cake Powder is the residue left after extracting neem oil, retaining the full spectrum of neem active compounds. It acts simultaneously as an organic fertiliser and a natural pest repellent.',
  '["Natural fertiliser & pest repellent","Rich in essential nutrients","100% natural & organic","Improves flowering & crop yield","Ready to use"]',
  'Incorporate into soil before planting or apply as a top dressing. Can be mixed with other organic inputs.',
  '["Home Gardening","Vegetable Crops","Organic Farming","Nurseries"]',
  279.00, 65, '2 kg', 4.60, 0, 1, 0, 0, 8
);

-- 9. Fish Amino Acid
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  9, 2,
  'Fish Amino Acid',
  'fish-amino-acid',
  'EM-ORG-004',
  'Meen Amilam — enriches soil, enhances growth, protects naturally.',
  'Natural Organic Fertilizer (Liquid)',
  'Premium Quality',
  'Fish Amino Acid (Meen Amilam) is a natural organic fertiliser derived from fish and jaggery that enriches soil fertility, promotes root growth, enhances photosynthesis and satisfies most crop nutritional requirements.',
  'Fish Amino Acid / Meen Amilam is an organic liquid fertiliser rich in amino acids, microorganisms and diverse nutrients. It increases soil fertility, maintains biomass of microorganisms and earthworms, promotes root growth and enhances photosynthesis.',
  '["Increases soil fertility and enriches soil nutrients","Maintains soil microorganism biomass","Promotes crop root growth and photosynthesis","Enhances yield and quality","Extends shelf life of produce","100% organic — suitable for all crops"]',
  'Foliar spray: dilute 2-5 ml per litre of water. Drip irrigation: use 500 ml per 1 litre in one acre. Seed treatment: mix 100 ml per 1 kg of seeds. Never use undiluted.',
  '["Vegetables","Fruits","Flowering Plants","Field Crops"]',
  349.00, 55, '1 Ltr', 4.80, 0, 1, 1, 1, 9
);

-- 10. Panchakaviyam
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  10, 2,
  'Panchakaviyam',
  'panchakaviyam',
  'EM-ORG-005',
  'Ancient organic liquid manure for complete plant health.',
  'Organic Liquid Manure / Repellant',
  'Premium Quality',
  'An organic liquid manure and natural repellant made from cow milk, cow ghee, cow curd, cow dung, cow urine, tender coconut, sugarcane juice and riped banana.',
  'Panchakaviyam is a time-tested organic liquid formulation that promotes natural plant growth, enhances yield and quality, extends shelf life, accelerates crop maturity, improves soil health, stimulates larger root production and acts as a natural pest defence.',
  '["Promotes natural plant growth","Enhances yield and quality","Extends shelf life","Accelerates crop maturity","Improves soil health and microbial activity","Boosts photosynthesis","Natural pest defence","100% organic"]',
  'Foliar spray: dilute 2 ml per 1 litre of water. Drip irrigation: use 500 ml per 1 litre in one acre. Seed treatment: mix 100 ml per 1 kg of seeds.',
  '["Vegetables","Fruits","Flowering Plants","Field Crops"]',
  349.00, 55, '1 Ltr', 4.90, 0, 1, 1, 1, 10
);

-- 11. Cocopeat
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  11, 3,
  'Cocopeat',
  'cocopeat',
  'EM-MED-001',
  'Expands up to 75 litres of soil. Low EC. Enriched with Trichoderma.',
  'Compressed Coconut Coir — Export Quality',
  'Export Quality',
  'Premium-quality Cocopeat enriched with Trichoderma. Improves soil health, protects roots from harmful fungi, promotes robust root growth and supports healthier, more productive plants.',
  'Our Export Quality Cocopeat is a compressed coconut coir block that expands up to 75 litres of growing medium. With low EC and enriched with Trichoderma, it creates an ideal rooting environment with excellent water retention and superior aeration.',
  '["Enriched with Trichoderma","Improves soil health","100% natural & organic","Promotes strong root growth","Supports healthy plant growth","Expands up to 75 litres","Low EC — safe for seedlings"]',
  'Soak the block in water until fully expanded (~75 litres). Use directly as a growing medium or blend with soil and compost.',
  '["Home Gardening","Terrace Gardening","Nurseries","Hydroponics"]',
  349.00, 80, '5 kg', 4.80, 0, 1, 1, 1, 11
);

-- 12. Potting Mix
INSERT IGNORE INTO `products`
  (`id`,`category_id`,`name`,`slug`,`sku`,`tagline`,`type`,`badge`,
   `description`,`long_description`,`benefits`,`usage_info`,`applications`,
   `price`,`stock`,`weight`,`rating`,`rating_count`,`is_active`,`is_featured`,`is_bestseller`,`sort_order`)
VALUES (
  12, 3,
  'Potting Mix',
  'potting-mix',
  'EM-MED-002',
  '18-in-1 premium blend for 30-50% deeper roots and faster growth.',
  'Premium 18-in-1 Growing Medium',
  'Premium Quality',
  'A premium quality Potting Mix — a perfect blend of natural ingredients that provides excellent aeration, water retention and nutrition for healthy plant growth.',
  'Our premium Potting Mix is an 18-in-1 formulation combining the best natural growing ingredients. Lightweight, promotes 30-50% deeper root development, enhances faster growth and is 100% natural and organic. Ready to use straight from the bag.',
  '["Lightweight","Enhances faster growth","100% natural & organic","30-50% deeper root development","Ready to use","18-in-1 premium blend"]',
  'Fill containers or raised beds directly. Use as-is or blend with existing soil. Ideal for potted plants, terrace gardens and seedling trays.',
  '["Home Gardening","Terrace Gardening","Nurseries","Flowering Plants"]',
  449.00, 60, '5 kg', 4.90, 0, 1, 1, 1, 12
);

-- ------------------------------------------------------------
-- Site settings defaults
-- ------------------------------------------------------------
INSERT IGNORE INTO `site_settings` (`setting_key`,`value`,`type`,`label`) VALUES
('site_name',       'Evergreen Media',                  'text',    'Site Name'),
('site_tagline',    'Grow Better. Nourish Naturally.',  'text',    'Site Tagline'),
('contact_email',   'hello@evergreenmedia.in',          'text',    'Contact Email'),
('contact_phone',   '+91 98000 00000',                  'text',    'Contact Phone'),
('shipping_charge', '0',                                'number',  'Flat Shipping Charge (₹)'),
('free_shipping_above', '500',                          'number',  'Free Shipping Above (₹)'),
('low_stock_threshold', '5',                            'number',  'Low Stock Alert Threshold'),
('currency',        'INR',                              'text',    'Currency Code'),
('currency_symbol', '₹',                               'text',    'Currency Symbol'),
('maintenance_mode','0',                                'boolean', 'Maintenance Mode');

SET FOREIGN_KEY_CHECKS = 1;
