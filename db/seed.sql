-- Seed data for Catering SCRUM
-- Run AFTER: dotnet ef database update
-- Login credentials: admin / password123, jsmith / password123

-- ============================================================
-- Companies
-- ============================================================
INSERT INTO "Companies" ("Name")
VALUES
  ('Default Company')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Users (BCrypt hash of "password123")
-- ============================================================
INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role", "CompanyId")
VALUES
  ('admin',  'admin@catering.local',  '$2b$10$ihY8jkI1JEeJjvKX/m7Vu.I4Pcd97wSpKNUIe5Op.1wq251B16dk6', 'Admin',    1),
  ('jsmith', 'jsmith@catering.local', '$2b$10$ihY8jkI1JEeJjvKX/m7Vu.I4Pcd97wSpKNUIe5Op.1wq251B16dk6', 'Employee', 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Events — mix of past (with financials) and upcoming
-- ============================================================
INSERT INTO "Events" ("Name", "Date", "GuestCount", "Budget", "FoodWasteLbs", "TotalCost", "TotalSales", "CreatedByUserId", "CompanyId")
VALUES
  -- Past events with full financial data (good for dashboard charts)
  ('Johnson Wedding Reception',  '2025-09-15T18:00:00Z', 150, 8500.00,  12.3, 6200.00,  9500.00,  1, 1),
  ('Tech Corp Annual Gala',      '2025-10-20T19:00:00Z', 200, 12000.00, 18.7, 9800.00,  14500.00, 1, 1),
  ('City Food Festival Booth',   '2025-11-05T10:00:00Z', 300, 5000.00,  25.0, 4200.00,  7800.00,  1, 1),
  ('Miller 50th Anniversary',    '2025-12-01T17:00:00Z', 80,  4000.00,  5.2,  3100.00,  4800.00,  2, 1),
  ('Holiday Corporate Luncheon', '2025-12-18T11:30:00Z', 120, 6000.00,  9.8,  5500.00,  7200.00,  1, 1),
  ('New Year Charity Dinner',    '2026-01-10T19:00:00Z', 175, 9000.00,  14.1, 7600.00,  10200.00, 2, 1),
  ('Valentines Day Banquet',     '2026-02-14T18:30:00Z', 90,  5500.00,  7.5,  4100.00,  6300.00,  1, 1),
  ('Spring Garden Party',        '2026-03-08T14:00:00Z', 110, 4500.00,  8.9,  3800.00,  5400.00,  2, 1),
  -- Recent event with high waste (outlier for correlation chart)
  ('Campus Welcome BBQ',         '2026-03-15T12:00:00Z', 250, 3500.00,  32.0, 3200.00,  4000.00,  1, 1),
  -- Upcoming events (no financials yet)
  ('Martinez Quinceañera',      '2026-04-05T16:00:00Z', 100, 6000.00,  NULL, NULL,      NULL,     2, 1),
  ('Startup Demo Day Lunch',     '2026-04-12T11:00:00Z', 60,  2500.00,  NULL, NULL,      NULL,     1, 1),
  ('Summer Solstice Feast',      '2026-06-21T18:00:00Z', 180, 10000.00, NULL, NULL,      NULL,     1, 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Menus
-- ============================================================
INSERT INTO "Menus" ("Name", "EventId")
VALUES
  ('Wedding Dinner Menu',     1),
  ('Gala Cocktail Menu',      2),
  ('Festival Street Food',    3),
  ('Anniversary Buffet',      4),
  ('Holiday Lunch Spread',    5),
  ('Charity Plated Dinner',   6),
  ('Valentines Prix Fixe',    7),
  ('Garden Party Bites',      8),
  ('BBQ Cookout Menu',        9),
  ('Quinceañera Feast',      10),
  ('Demo Day Boxed Lunch',   11)
ON CONFLICT DO NOTHING;

-- ============================================================
-- Menu Items (with waste tracking on past events)
-- ============================================================
INSERT INTO "MenuItems" ("Name", "Category", "QuantityOrdered", "QuantityWasted", "MenuId")
VALUES
  -- Wedding (menu 1)
  ('Herb-Crusted Salmon',     'Entree',      150, 8,  1),
  ('Caesar Salad',            'Salad',       150, 12, 1),
  ('Garlic Mashed Potatoes',  'Side',        150, 10, 1),
  ('Tiramisu',                'Dessert',     150, 5,  1),

  -- Gala (menu 2)
  ('Beef Sliders',            'Appetizer',   400, 25, 2),
  ('Shrimp Cocktail',         'Appetizer',   300, 18, 2),
  ('Mini Cheesecakes',        'Dessert',     200, 15, 2),

  -- Festival (menu 3)
  ('Pulled Pork Tacos',       'Entree',      500, 40, 3),
  ('Elote Cups',              'Side',        400, 30, 3),
  ('Churros',                 'Dessert',     350, 20, 3),

  -- Anniversary (menu 4)
  ('Chicken Parmesan',        'Entree',      80,  4,  4),
  ('Garden Salad',            'Salad',       80,  6,  4),
  ('Rolls and Butter',        'Side',        100, 8,  4),

  -- Holiday Lunch (menu 5)
  ('Turkey Carving Station',  'Entree',      120, 10, 5),
  ('Cranberry Walnut Salad',  'Salad',       120, 8,  5),
  ('Pumpkin Pie',             'Dessert',     120, 7,  5),

  -- Charity Dinner (menu 6)
  ('Filet Mignon',            'Entree',      175, 12, 6),
  ('Lobster Bisque',          'Soup',        175, 14, 6),
  ('Chocolate Mousse',        'Dessert',     175, 9,  6),

  -- Valentines (menu 7)
  ('Pan-Seared Duck',         'Entree',      90,  5,  7),
  ('Caprese Salad',           'Salad',       90,  7,  7),
  ('Red Velvet Cake',         'Dessert',     90,  4,  7),

  -- Garden Party (menu 8)
  ('Bruschetta',              'Appetizer',   200, 15, 8),
  ('Cucumber Sandwiches',     'Appetizer',   150, 10, 8),
  ('Lemon Tarts',             'Dessert',     110, 8,  8),

  -- BBQ (menu 9)
  ('Smoked Brisket',          'Entree',      250, 30, 9),
  ('Coleslaw',                'Side',        250, 25, 9),
  ('Cornbread',               'Side',        300, 20, 9),
  ('Banana Pudding',          'Dessert',     200, 18, 9)
ON CONFLICT DO NOTHING;
