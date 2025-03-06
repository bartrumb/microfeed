-- Migration number: 0000 Description: Initial feed content table

-- Create the feed_content table
CREATE TABLE IF NOT EXISTS feed_content (
    channel TEXT NOT NULL,
    items TEXT,
    settings TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);