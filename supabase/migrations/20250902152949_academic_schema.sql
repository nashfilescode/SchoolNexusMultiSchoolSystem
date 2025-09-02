-- Create academic_years table
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create terms table
CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for the new tables
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "School entities are viewable by users of that school."
ON academic_years FOR SELECT
USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "School admins can manage academic years for their school."
ON academic_years FOR ALL
USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'school_admin');

CREATE POLICY "School entities are viewable by users of that school."
ON terms FOR SELECT
USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "School admins can manage terms for their school."
ON terms FOR ALL
USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'school_admin');

CREATE POLICY "School entities are viewable by users of that school."
ON classes FOR SELECT
USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "School admins can manage classes for their school."
ON classes FOR ALL
USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'school_admin');

CREATE POLICY "School entities are viewable by users of that school."
ON subjects FOR SELECT
USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "School admins can manage subjects for their school."
ON subjects FOR ALL
USING (school_id = (SELECT school_id FROM public.profiles WHERE id = auth.uid()) AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'school_admin');

-- Note: Pre-populating data like classes and subjects would typically be done
-- via seeding scripts or application logic after a school is created.
-- Adding direct inserts here would require a known school_id.
-- For now, the table structures and RLS are the key part of the migration.
-- The UI will handle the creation of these entities for a specific school.
