-- Add form_id to staff (each staff gets their own unique form)
ALTER TABLE staff ADD COLUMN form_id UUID REFERENCES forms(id) ON DELETE SET NULL;
CREATE INDEX idx_staff_form ON staff(form_id);
