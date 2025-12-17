-- Create draft_order table for tracking annual draft positions
CREATE TABLE IF NOT EXISTS ff.draft_order (
    id SERIAL PRIMARY KEY,
    season INTEGER NOT NULL,
    team_id INTEGER NOT NULL,
    draft_position INTEGER NOT NULL,
    FOREIGN KEY (team_id) REFERENCES ff.teams(id),
    UNIQUE(season, team_id),
    UNIQUE(season, draft_position)
);

CREATE INDEX idx_draft_order_season ON ff.draft_order(season);
CREATE INDEX idx_draft_order_team ON ff.draft_order(team_id);