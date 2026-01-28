-- Add community_growth_day135 email type to email_catalog
-- This is required because scheduled_emails has a foreign key constraint on email_type

INSERT INTO public.email_catalog (id, description, enabled)
VALUES ('community_growth_day135', '135-day community growth email asking users to help spread the word', true)
ON CONFLICT (id) DO NOTHING;
