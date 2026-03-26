-- Seed data for Catering SCRUM
-- Run AFTER: dotnet ef database update
--
-- This script CLEARS all existing data and reloads fresh fake data.
-- Login credentials: chef_anna / password123  |  marcus_w / password123  |  priya_k / password123
--
-- Usage (local Postgres):
--   psql -U postgres -d catering -f db/seed.sql
-- Usage (Neon):
--   psql "<connection-string>" -f db/seed.sql

-- ============================================================
-- RESET (FK-safe order)
-- ============================================================
TRUNCATE TABLE
  "MenuItems",
  "Menus",
  "Tasks",
  "Events",
  "Users",
  "Companies"
  RESTART IDENTITY CASCADE;

-- ============================================================
-- Companies
-- ============================================================
INSERT INTO "Companies" ("Name", "JoinCode")
VALUES
  ('Golden Fork Catering', 'GOLDFORK');
-- Company Id = 1

-- ============================================================
-- Users  (BCrypt hash of "password123")
-- ============================================================
INSERT INTO "Users" ("Username", "Email", "PasswordHash", "Role", "CompanyId")
VALUES
  ('chef_anna', 'anna@goldenfork.com',   '$2b$10$ihY8jkI1JEeJjvKX/m7Vu.I4Pcd97wSpKNUIe5Op.1wq251B16dk6', 'Admin',    1),
  ('marcus_w',  'marcus@goldenfork.com', '$2b$10$ihY8jkI1JEeJjvKX/m7Vu.I4Pcd97wSpKNUIe5Op.1wq251B16dk6', 'Employee', 1),
  ('priya_k',   'priya@goldenfork.com',  '$2b$10$ihY8jkI1JEeJjvKX/m7Vu.I4Pcd97wSpKNUIe5Op.1wq251B16dk6', 'Employee', 1);
-- chef_anna = 1, marcus_w = 2, priya_k = 3

-- ============================================================
-- Events
-- Past events have full financial data for dashboard charts.
-- Upcoming events have NULL financials.
-- ============================================================
INSERT INTO "Events" ("Name", "Date", "GuestCount", "Budget", "FoodWasteLbs", "TotalCost", "TotalSales", "CreatedByUserId", "CompanyId")
VALUES
  -- Past events with financials --------------------------------
  ('Riverside Wedding Reception',    '2025-08-10T17:00:00Z', 200, 11000.00,  15.2, 8400.00,  12500.00, 1, 1),
  ('Downtown Corporate Retreat',     '2025-09-25T11:30:00Z', 120,  7500.00,   9.5, 5900.00,   8800.00, 1, 1),
  ('Harvest Festival Booth',         '2025-10-18T10:00:00Z', 400,  6000.00,  28.0, 5100.00,   9200.00, 2, 1),
  ('Thompson Silver Anniversary',    '2025-11-22T18:00:00Z',  75,  4200.00,   4.8, 3200.00,   5100.00, 3, 1),
  ('Holiday Office Party',           '2025-12-15T18:30:00Z', 150,  8000.00,  11.3, 6700.00,   9400.00, 1, 1),
  ('New Year Eve Gala',              '2026-01-01T20:00:00Z', 220, 14000.00,  19.6, 11200.00,  16500.00, 1, 1),
  ('Galentines Day Brunch',          '2026-02-13T10:30:00Z',  65,  3800.00,   5.1, 3000.00,   4600.00, 2, 1),
  ('St. Patrick Day Pub Catering',   '2026-03-17T16:00:00Z',  90,  4500.00,  22.4, 3900.00,   5800.00, 3, 1),
  -- Upcoming events (no financials) ---------------------------
  ('Patel Rehearsal Dinner',         '2026-04-18T19:00:00Z',  55,  4000.00,  NULL, NULL,       NULL,    1, 1),
  ('College Graduation Banquet',     '2026-05-10T12:00:00Z', 300, 16000.00,  NULL, NULL,       NULL,    2, 1),
  ('Midsummer Night Soiree',         '2026-07-12T18:00:00Z', 140,  9500.00,  NULL, NULL,       NULL,    1, 1);

-- ============================================================
-- Menus  (one per event)
-- ============================================================
INSERT INTO "Menus" ("Name", "EventId")
VALUES
  ('Wedding Plated Dinner',       1),
  ('Corporate Lunch Buffet',      2),
  ('Festival Street Food',        3),
  ('Anniversary Family Buffet',   4),
  ('Holiday Party Stations',      5),
  ('NYE Cocktail & Dinner',       6),
  ('Galentines Brunch Board',     7),
  ('Irish Pub Bites',             8),
  ('Rehearsal Dinner Menu',       9),
  ('Graduation Celebration Menu', 10);

-- ============================================================
-- Menu Items
-- ============================================================
INSERT INTO "MenuItems" ("Name", "Category", "QuantityOrdered", "QuantityWasted", "MenuId")
VALUES
  -- Wedding Plated Dinner (menu 1) ----------------------------
  ('Filet Mignon',             'Entree',    200, 11, 1),
  ('Pan-Seared Salmon',        'Entree',    200,  9, 1),
  ('Wedge Salad',              'Salad',     200, 14, 1),
  ('Truffle Mashed Potatoes',  'Side',      200, 12, 1),
  ('Crème Brûlée',             'Dessert',   200,  6, 1),

  -- Corporate Lunch Buffet (menu 2) ---------------------------
  ('Grilled Chicken Breast',   'Entree',    120,  8, 2),
  ('Pasta Primavera',          'Entree',    120, 10, 2),
  ('Mixed Greens Salad',       'Salad',     120, 11, 2),
  ('Dinner Rolls',             'Side',      150, 15, 2),
  ('Assorted Cookies',         'Dessert',   120,  9, 2),

  -- Festival Street Food (menu 3) ----------------------------
  ('Smash Burgers',            'Entree',    600, 35, 3),
  ('Sweet Potato Fries',       'Side',      500, 28, 3),
  ('Elote Cups',               'Side',      400, 22, 3),
  ('Funnel Cake Bites',        'Dessert',   350, 18, 3),

  -- Anniversary Family Buffet (menu 4) -----------------------
  ('Chicken Piccata',          'Entree',     75,  4, 4),
  ('Garden Salad',             'Salad',      75,  5, 4),
  ('Roasted Vegetables',       'Side',       75,  6, 4),
  ('Italian Cream Cake',       'Dessert',    75,  3, 4),

  -- Holiday Party Stations (menu 5) --------------------------
  ('Carving Station Turkey',   'Entree',    150, 10, 5),
  ('Seafood Bisque',           'Soup',      150, 12, 5),
  ('Cranberry Pecan Salad',    'Salad',     150,  9, 5),
  ('Peppermint Cheesecake',    'Dessert',   150,  8, 5),

  -- NYE Cocktail & Dinner (menu 6) ---------------------------
  ('Beef Wellington Slices',   'Entree',    220, 16, 6),
  ('Lobster Bisque',           'Soup',      220, 14, 6),
  ('Caprese Tower',            'Appetizer', 330, 20, 6),
  ('Chocolate Fondue',         'Dessert',   220, 10, 6),

  -- Galentines Brunch (menu 7) --------------------------------
  ('Avocado Toast',            'Entree',     65,  5, 7),
  ('Belgian Waffles',          'Entree',     65,  4, 7),
  ('Fruit Charcuterie Board',  'Side',       65,  3, 7),
  ('Mimosa Bar',               'Beverage',   65,  2, 7),

  -- Irish Pub Bites (menu 8) ----------------------------------
  ('Corned Beef Sliders',      'Entree',     90, 20, 8),
  ('Boxty Potato Cakes',       'Side',       90, 18, 8),
  ('Colcannon',                'Side',       90, 15, 8),
  ('Guinness Brownies',        'Dessert',    90,  8, 8),

  -- Rehearsal Dinner (menu 9) — upcoming, no waste yet -------
  ('Braised Short Rib',        'Entree',     55, 0, 9),
  ('Roasted Beet Salad',       'Salad',      55, 0, 9),
  ('Duchess Potatoes',         'Side',       55, 0, 9),
  ('Lemon Panna Cotta',        'Dessert',    55, 0, 9),

  -- Graduation Menu (menu 10) — upcoming, no waste yet -------
  ('BBQ Chicken Quarters',     'Entree',    300, 0, 10),
  ('Mac and Cheese Bar',       'Side',      300, 0, 10),
  ('Coleslaw',                 'Side',      300, 0, 10),
  ('Sheet Cake Assortment',    'Dessert',   300, 0, 10);

-- ============================================================
-- Tasks
-- ============================================================
INSERT INTO "Tasks" ("Title", "Description", "Status", "DueDate", "EventId", "CompanyId")
VALUES
  -- Patel Rehearsal Dinner (event 9) -------------------------
  ('Confirm venue setup time',       'Coordinate with hotel banquet manager.',          'InProgress', '2026-04-12T00:00:00Z', 9,    1),
  ('Finalize floral center pieces',  'Anna to call vendor for quote approval.',         'Pending',    '2026-04-10T00:00:00Z', 9,    1),
  ('Send final headcount to kitchen','Guest RSVPs close April 14.',                     'Pending',    '2026-04-14T00:00:00Z', 9,    1),

  -- College Graduation Banquet (event 10) --------------------
  ('Order serving equipment rental', '8 chafing dishes + 4 carving stations needed.',  'Pending',    '2026-04-25T00:00:00Z', 10,   1),
  ('Hire 4 temp servers',            'Post on catering job board by end of April.',     'Pending',    '2026-04-30T00:00:00Z', 10,   1),
  ('Submit dietary restriction form','Collect allergies from event coordinator.',       'InProgress', '2026-04-20T00:00:00Z', 10,   1),

  -- Midsummer Night Soiree (event 11) -----------------------
  ('Design tasting menu draft',      'Three course or prix fixe TBD with client.',      'Pending',    '2026-06-01T00:00:00Z', 11,   1),

  -- Completed tasks ------------------------------------------
  ('Submit St. Patrick post-event report', 'Waste log and sales reconciliation.',       'Done',       '2026-03-20T00:00:00Z', 8,    1),
  ('Log waste data for Galentines',        'Enter into analytics dashboard.',           'Done',       '2026-02-15T00:00:00Z', 7,    1),
  ('Invoice Holiday Office Party',         'Net-30 terms. Invoice sent 2025-12-16.',   'Done',       '2025-12-20T00:00:00Z', 5,    1),

  -- General / no-event tasks ---------------------------------
  ('Test new summer dessert recipes',     'Marcus to run trial batch next Friday.',     'InProgress', '2026-04-04T00:00:00Z', NULL, 1),
  ('Update staff availability for May',   'Collect from team by April 10.',             'Pending',    '2026-04-10T00:00:00Z', NULL, 1),
  ('Renew liability insurance',           'Current policy expires June 30.',            'Pending',    '2026-06-15T00:00:00Z', NULL, 1);
