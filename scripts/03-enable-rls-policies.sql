-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rule_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Students can view own data" ON public.students;
DROP POLICY IF EXISTS "Admins and schools can view all students" ON public.students;
DROP POLICY IF EXISTS "Students can insert own data" ON public.students;
DROP POLICY IF EXISTS "Admins and schools can manage students" ON public.students;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow insert for authenticated users" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Students policies
CREATE POLICY "Students can view own data" ON public.students
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

CREATE POLICY "Students can insert own data" ON public.students
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

CREATE POLICY "Students can update own data" ON public.students
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

-- Companies policies
CREATE POLICY "Companies can manage own data" ON public.companies
    FOR ALL USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

-- Positions policies
CREATE POLICY "Companies can manage own positions" ON public.positions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.companies 
            WHERE id = company_id 
            AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

CREATE POLICY "Everyone can view positions" ON public.positions
    FOR SELECT USING (true);

-- Matches policies
CREATE POLICY "Users can view relevant matches" ON public.matches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.students 
            WHERE id = student_id 
            AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.positions p
            JOIN public.companies c ON p.company_id = c.id
            WHERE p.id = position_id 
            AND c.user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

CREATE POLICY "Admins can manage matches" ON public.matches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role IN ('ADMIN', 'SCHOOL')
        )
    );

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Match rules policies (public read, admin write)
CREATE POLICY "Everyone can view match rules" ON public.match_rules
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage match rules" ON public.match_rules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Everyone can view match rule items" ON public.match_rule_items
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage match rule items" ON public.match_rule_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'ADMIN'
        )
    );
