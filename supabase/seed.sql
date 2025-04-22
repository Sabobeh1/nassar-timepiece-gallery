-- Insert first admin user (replace USER_ID with the actual user ID from auth.users)
INSERT INTO admin_users (user_id)
VALUES ('USER_ID')
ON CONFLICT (user_id) DO NOTHING; 