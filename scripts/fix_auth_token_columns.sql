-- Fix GoTrue scanner failure ("Database error querying schema")
-- When users are directly seeded or modified in auth.users, GoTrue's Go driver expects non-NULL strings.
-- This script replaces all NULL token and change columns across all auth.users with empty strings.

UPDATE auth.users
SET
  confirmation_token          = COALESCE(confirmation_token, ''),
  recovery_token              = COALESCE(recovery_token, ''),
  email_change_token_new      = COALESCE(email_change_token_new, ''),
  email_change_token_current  = COALESCE(email_change_token_current, ''),
  phone_change_token          = COALESCE(phone_change_token, ''),
  reauthentication_token      = COALESCE(reauthentication_token, ''),
  email_change                = COALESCE(email_change, ''),
  phone_change                = COALESCE(phone_change, '')
WHERE confirmation_token IS NULL
   OR recovery_token IS NULL
   OR email_change IS NULL
   OR email_change_token_new IS NULL
   OR email_change_token_current IS NULL
   OR phone_change_token IS NULL
   OR reauthentication_token IS NULL
   OR phone_change IS NULL;
