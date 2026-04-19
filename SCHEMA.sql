-- NightFlow Database Schema
-- Run this in your Supabase SQL Editor

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  priority TEXT DEFAULT 'Medium',
  due_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- History Table
CREATE TABLE IF NOT EXISTS history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  task_id UUID,
  title TEXT,
  category TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  stats JSONB DEFAULT '{}'::jsonb
);

-- Timers Table
CREATE TABLE IF NOT EXISTS timers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  task_id UUID,
  duration INTEGER NOT NULL, -- in seconds
  started_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' -- active, paused, completed
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  data JSONB NOT NULL, -- { total_completed: 10, focus_hours: 5, score: 85 }
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for tasks
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE timers;
