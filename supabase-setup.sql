CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    work_days INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS designated_rest (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id),
    month TEXT NOT NULL,
    dates TEXT[] DEFAULT '{}',
    leave_types JSONB DEFAULT '{}'::jsonb,
    submitted BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS schedules (
    id SERIAL PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id),
    month TEXT NOT NULL,
    schedule JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_designated_rest_employee_month ON designated_rest(employee_id, month);
CREATE INDEX idx_schedules_employee_month ON schedules(employee_id, month);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE designated_rest ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all users to read employees" ON employees
    FOR SELECT USING (true);

CREATE POLICY "Allow all users to read designated_rest" ON designated_rest
    FOR SELECT USING (true);

CREATE POLICY "Allow all users to read schedules" ON schedules
    FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert designated_rest" ON designated_rest
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update designated_rest" ON designated_rest
    FOR UPDATE USING (true);

CREATE POLICY "Allow all users to insert schedules" ON schedules
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update schedules" ON schedules
    FOR UPDATE USING (true);