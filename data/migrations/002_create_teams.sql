-- Create teams table for season records
CREATE TABLE IF NOT EXISTS ff.teams (
    id SERIAL PRIMARY KEY,
    season INTEGER NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    ties INTEGER DEFAULT 0,
    points_for DECIMAL(10,2) DEFAULT 0,
    points_against DECIMAL(10,2) DEFAULT 0,
    final_standing INTEGER,
    made_playoffs BOOLEAN DEFAULT FALSE,
    playoff_finish INTEGER, -- 1 = champion, 2 = runner-up, etc
    draft_position INTEGER,
    FOREIGN KEY (owner_id) REFERENCES ff.owners(id),
    UNIQUE(season, team_name)
);

CREATE INDEX idx_teams_season ON ff.teams(season);
CREATE INDEX idx_teams_owner ON ff.teams(owner_id);
CREATE INDEX idx_teams_standing ON ff.teams(season, final_standing);