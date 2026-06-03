-- Restrict food serving units to grams or countable units
ALTER TABLE "foods"
ADD CONSTRAINT "foods_serving_unit_check"
CHECK ("serving_unit" IN ('g', 'unit'));
