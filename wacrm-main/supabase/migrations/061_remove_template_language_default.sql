-- Language is selected explicitly by the template author/synced exactly
-- from Meta. Do not silently assign an English locale to new rows.
ALTER TABLE message_templates
  ALTER COLUMN language DROP DEFAULT;
