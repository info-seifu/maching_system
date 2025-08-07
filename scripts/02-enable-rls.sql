-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_rule_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Students policies
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = user_id 
            AND id = auth.uid()
        )
    );

CREATE POLICY "Admins and schools can view all students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

CREATE POLICY "Students can insert own data" ON students
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = user_id 
            AND id = auth.uid()
        )
    );

CREATE POLICY "Admins and schools can manage students" ON students
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

-- Companies policies
CREATE POLICY "Companies can view own data" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = user_id 
            AND id = auth.uid()
        )
    );

CREATE POLICY "Admins and schools can view all companies" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

CREATE POLICY "Companies can insert own data" ON companies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = user_id 
            AND id = auth.uid()
        )
    );

CREATE POLICY "Admins and schools can manage companies" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

-- Positions policies
CREATE POLICY "Companies can manage own positions" ON positions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM companies 
            WHERE id = company_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Everyone can view positions" ON positions
    FOR SELECT USING (true);

-- Matches policies
CREATE POLICY "Students can view own matches" ON matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE id = student_id 
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Companies can view matches for their positions" ON matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM positions p
            JOIN companies c ON p.company_id = c.id
            WHERE p.id = position_id 
            AND c.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all matches" ON matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Match rules policies
CREATE POLICY "Admins can manage match rules" ON match_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Everyone can view match rules" ON match_rules
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage match rule items" ON match_rule_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Everyone can view match rule items" ON match_rule_items
    FOR SELECT USING (true);
