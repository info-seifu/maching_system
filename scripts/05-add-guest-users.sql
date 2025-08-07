-- ゲストモード用のユーザーをusersテーブルに追加
INSERT INTO public.users (id, email, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@example.com', 'ADMIN'),
('550e8400-e29b-41d4-a716-446655440004', 'student@example.com', 'STUDENT'),
('550e8400-e29b-41d4-a716-446655440003', 'company@example.com', 'COMPANY')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    updated_at = NOW();

-- ゲスト学生用のプロフィールを作成
INSERT INTO public.students (id, user_id, name, furigana, birthday, gender, expertise) VALUES
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'ゲスト学生', 'ゲストガクセイ', '2005-01-01', '男', 'Webフロントエンド')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    furigana = EXCLUDED.furigana,
    birthday = EXCLUDED.birthday,
    gender = EXCLUDED.gender,
    expertise = EXCLUDED.expertise,
    updated_at = NOW();

-- ゲスト企業用のプロフィールを作成
INSERT INTO public.companies (id, user_id, name, industry, location, contact_email) VALUES
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440003', 'ゲスト企業株式会社', 'IT', '東京都', 'company@example.com')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    industry = EXCLUDED.industry,
    location = EXCLUDED.location,
    contact_email = EXCLUDED.contact_email,
    updated_at = NOW();
