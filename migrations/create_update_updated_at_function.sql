-- Description: Create function to update updated_at timestamp automatically
-- Created: 2023-07-06

-- SQL statement below
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql; 