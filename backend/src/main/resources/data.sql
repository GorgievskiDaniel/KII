USE kii_app_db;

INSERT INTO tasks (title, description, status, created_at, updated_at) VALUES
('Welcome', 'This is your first task — edit or delete it.', 'OPEN', NOW(), NOW());
