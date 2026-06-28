CREATE DATABASE IF NOT EXISTS kii_app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kii_app_db;

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT,
    title varchar(255) NOT NULL,
    description TEXT,
    status varchar(50) NOT NULL DEFAULT 'OPEN',
    due_date datetime NULL,
    created_at datetime NOT NULL,
    updated_at datetime NOT NULL,
    PRIMARY KEY (id)
);
