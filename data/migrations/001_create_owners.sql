-- Create owners table
CREATE TABLE IF NOT EXISTS ff.owners (
    id UUID PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100)
);

CREATE INDEX idx_owners_display_name ON ff.owners(display_name);