-- Create matchups table for weekly results
CREATE TABLE IF NOT EXISTS ff.matchups (
    id SERIAL PRIMARY KEY,
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,
    home_score DECIMAL(10,2),
    away_score DECIMAL(10,2),
    is_playoff BOOLEAN DEFAULT FALSE,
    is_championship BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (home_team_id) REFERENCES ff.teams(id),
    FOREIGN KEY (away_team_id) REFERENCES ff.teams(id),
    -- Ensure each matchup is unique per season/week/teams
    CONSTRAINT matchups_unique_game UNIQUE (season, week, home_team_id, away_team_id)
);

CREATE INDEX idx_matchups_season_week ON ff.matchups(season, week);
CREATE INDEX idx_matchups_teams ON ff.matchups(home_team_id, away_team_id);