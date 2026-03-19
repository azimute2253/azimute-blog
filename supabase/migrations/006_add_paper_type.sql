-- Add 'paper' to content_items type constraint
ALTER TABLE content_items DROP CONSTRAINT content_items_type_check;
ALTER TABLE content_items ADD CONSTRAINT content_items_type_check 
  CHECK (type IN ('report', 'project', 'document', 'paper'));
