ALTER TABLE availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own availability"
ON availability
FOR ALL
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());