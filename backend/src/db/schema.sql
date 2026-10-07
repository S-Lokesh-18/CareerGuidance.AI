-- Database schema for AI Career Guidance Portal
-- Safe to re-run (idempotent)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS careers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    required_skills JSONB NOT NULL,
    interest_tags JSONB NOT NULL,
    salary_range VARCHAR(100) NOT NULL,
    demand_level VARCHAR(50) NOT NULL
);

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='careers' AND column_name='salary_range') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='careers' AND column_name='avg_salary_range') THEN
            ALTER TABLE careers RENAME COLUMN avg_salary_range TO salary_range;
        ELSE
            ALTER TABLE careers ADD COLUMN salary_range VARCHAR(100);
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    answers JSONB NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    career_id INTEGER REFERENCES careers(id) ON DELETE CASCADE,
    plan JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roadmap_progress (
    id SERIAL PRIMARY KEY,
    roadmap_id INTEGER REFERENCES roadmaps(id) ON DELETE CASCADE,
    task_id VARCHAR(100) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    CONSTRAINT unique_roadmap_task UNIQUE (roadmap_id, task_id)
);

CREATE TABLE IF NOT EXISTS resume_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    match_score INTEGER NOT NULL,
    result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_progress_roadmap_id ON roadmap_progress(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
