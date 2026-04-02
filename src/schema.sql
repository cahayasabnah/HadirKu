-- 1. Profiles table (linked to Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'guru' CHECK (role IN ('admin', 'guru')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Students table
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nisn TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Teacher Attendance table
CREATE TABLE teacher_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT CHECK (status IN ('hadir', 'izin', 'sakit', 'terlambat')) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(teacher_id, date)
);

-- 4. Student Attendance table
CREATE TABLE student_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  status TEXT CHECK (status IN ('hadir', 'izin', 'sakit', 'alfa')) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(student_id, date)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_attendance ENABLE ROW LEVEL SECURITY;

-- Policies (Simple for now, can be hardened)
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Students are viewable by authenticated users." ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage students." ON students FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Teacher attendance viewable by everyone." ON teacher_attendance FOR SELECT USING (true);
CREATE POLICY "Teachers can insert own attendance." ON teacher_attendance FOR INSERT WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Student attendance viewable by authenticated users." ON student_attendance FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Teachers can manage student attendance." ON student_attendance FOR ALL USING (auth.role() = 'authenticated');

-- Function to handle new user and set first user as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_first_user BOOLEAN;
BEGIN
  SELECT (COUNT(*) = 0) INTO is_first_user FROM public.profiles;
  
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    CASE WHEN is_first_user THEN 'admin' ELSE 'guru' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
