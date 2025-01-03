-- Creare și utilizare schema
CREATE SCHEMA IF NOT EXISTS linkfile;

-- Setare schema curentă
SET search_path TO linkfile;

-- Tabela pentru utilizatori
CREATE TABLE users (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_ VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT uk_username UNIQUE (username),
    CONSTRAINT uk_email UNIQUE (email),
    CONSTRAINT chk_role CHECK (role_ IN ('user', 'admin'))
);

-- Tabela pentru fișiere
CREATE TABLE files (
    file_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    file_path TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    share_token VARCHAR(255) UNIQUE,       
    share_enabled BOOLEAN DEFAULT FALSE,    

    CONSTRAINT fk_file_user FOREIGN KEY (user_id) 
        REFERENCES users(user_id) 
        ON DELETE CASCADE
);

-- Indexuri pentru optimizarea performanței
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_files_share_token ON files(share_token); 
CREATE INDEX idx_files_share_enabled ON files(share_enabled); 

