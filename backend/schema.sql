CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  email text UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title text NOT NULL,
  status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);


CREATE TABLE work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id uuid REFERENCES tasks(id) ON DELETE SET NULL,

  session_type text NOT NULL CHECK (session_type IN ('work', 'break')),

  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL,

  duration_seconds integer NOT NULL CHECK (duration_seconds >= 0),

  created_at timestamptz NOT NULL DEFAULT now(),

  CHECK (ended_at >= started_at)
);

CREATE INDEX idx_sessions_user_started_at ON work_sessions(user_id, started_at DESC);
CREATE INDEX idx_sessions_task_started_at ON work_sessions(task_id, started_at DESC);
CREATE INDEX idx_sessions_user_type ON work_sessions(user_id, session_type);