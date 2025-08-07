-- Insert sample data

-- Get the actual user ID for the existing user and create student profile
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Get the user ID from auth.users
    SELECT id INTO existing_user_id 
    FROM auth.users 
    WHERE email = 'user+1750772130206@example.com';
    
    -- If user exists, create a student profile
    IF existing_user_id IS NOT NULL THEN
        INSERT INTO students (user_id, name, furigana, birthday, gender, expertise) VALUES
        (existing_user_id, '田中太郎', 'タナカタロウ', '2005-04-15', '男', 'Webフロントエンド')
        ON CONFLICT (user_id) DO UPDATE SET
            name = EXCLUDED.name,
            furigana = EXCLUDED.furigana,
            birthday = EXCLUDED.birthday,
            gender = EXCLUDED.gender,
            expertise = EXCLUDED.expertise;
    END IF;
END $$;

-- Insert sample users for demo (these would need to be created in Supabase Auth first)
INSERT INTO users (id, email, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', 'ADMIN'),
('550e8400-e29b-41d4-a716-446655440002', 'school@example.com', 'SCHOOL'),
('550e8400-e29b-41d4-a716-446655440003', 'abc@example.com', 'COMPANY')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- Insert sample companies
INSERT INTO companies (id, user_id, name, industry, location, contact_email) VALUES
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'ABC株式会社', 'IT', '東京都', 'abc@example.com'),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'XYZ Corporation', 'テクノロジー', '大阪府', 'xyz@example.com')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    location = EXCLUDED.location,
    contact_email = EXCLUDED.contact_email;

-- Insert sample students (without user_id for demo purposes)
INSERT INTO students (id, name, furigana, birthday, gender, expertise) VALUES
('770e8400-e29b-41d4-a716-446655440001', '山田太郎', 'ヤマダタロウ', '2005-04-15', '男', 'Webフロントエンド'),
('770e8400-e29b-41d4-a716-446655440002', '佐藤花子', 'サトウハナコ', '2005-06-22', '女', 'データサイエンス'),
('770e8400-e29b-41d4-a716-446655440003', '鈴木一郎', 'スズキイチロウ', '2005-08-03', '男', 'バックエンド開発'),
('770e8400-e29b-41d4-a716-446655440004', '田中美咲', 'タナカミサキ', '2005-02-14', '女', 'UI/UXデザイン'),
('770e8400-e29b-41d4-a716-446655440005', '高橋健太', 'タカハシケンタ', '2005-11-28', '男', '機械学習')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    furigana = EXCLUDED.furigana,
    birthday = EXCLUDED.birthday,
    gender = EXCLUDED.gender,
    expertise = EXCLUDED.expertise;

-- Insert sample positions
INSERT INTO positions (id, company_id, title, description, required_expertise, start_date, end_date, status) VALUES
('880e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Webフロントエンドエンジニア', 'React/Next.jsを使用したWebアプリケーション開発', ARRAY['Webフロントエンド', 'UI/UXデザイン'], '2025-04-01', '2025-12-31', 'OPEN'),
('880e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'データサイエンティスト', '機械学習を活用したデータ分析業務', ARRAY['データサイエンス', '機械学習'], '2025-05-01', '2025-12-31', 'OPEN'),
('880e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440002', 'バックエンドエンジニア', 'Node.js/Pythonを使用したAPI開発', ARRAY['バックエンド開発'], '2025-06-01', '2025-12-31', 'OPEN')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    required_expertise = EXCLUDED.required_expertise,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status;

-- Insert sample matches
INSERT INTO matches (student_id, position_id, match_score, status) VALUES
('770e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 92, 'PROPOSED'),
('770e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440002', 95, 'ACCEPTED'),
('770e8400-e29b-41d4-a716-446655440003', '880e8400-e29b-41d4-a716-446655440003', 88, 'PROPOSED')
ON CONFLICT (student_id, position_id) DO UPDATE SET
    match_score = EXCLUDED.match_score,
    status = EXCLUDED.status;

-- Insert default match rule
INSERT INTO match_rules (id, name, description) VALUES
('990e8400-e29b-41d4-a716-446655440001', 'デフォルトマッチングルール', '標準的なマッチングアルゴリズム')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO match_rule_items (rule_id, attribute_name, weight) VALUES
('990e8400-e29b-41d4-a716-446655440001', '得意分野マッチ', 70.00),
('990e8400-e29b-41d4-a716-446655440001', '年齢属性', 15.00),
('990e8400-e29b-41d4-a716-446655440001', '性別属性', 5.00),
('990e8400-e29b-41d4-a716-446655440001', 'ランダム', 10.00)
ON CONFLICT (rule_id, attribute_name) DO UPDATE SET
    weight = EXCLUDED.weight;
