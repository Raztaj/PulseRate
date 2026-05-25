-- PulseRate Database Schema

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subscription_plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Admins (linked to auth.users)
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff members
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  department TEXT DEFAULT '',
  position TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feedback forms
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Questions within a form
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'star_rating',
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0
);

-- Customer submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Answers within a submission
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  rating_value INTEGER,
  text_answer TEXT
);

-- Indexes
CREATE INDEX idx_staff_organization ON staff(organization_id);
CREATE INDEX idx_forms_organization ON forms(organization_id);
CREATE INDEX idx_questions_form ON questions(form_id);
CREATE INDEX idx_submissions_staff ON submissions(staff_id);
CREATE INDEX idx_submissions_form ON submissions(form_id);
CREATE INDEX idx_answers_submission ON answers(submission_id);

-- Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their organization" ON organizations
  FOR UPDATE USING (
    id IN (SELECT organization_id FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage staff" ON staff
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage forms" ON forms
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM admins WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage questions" ON questions
  FOR ALL USING (
    form_id IN (
      SELECT id FROM forms
      WHERE organization_id IN (
        SELECT organization_id FROM admins WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can submit feedback" ON submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view submissions" ON submissions
  FOR SELECT USING (
    staff_id IN (
      SELECT id FROM staff
      WHERE organization_id IN (
        SELECT organization_id FROM admins WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Anyone can answer questions" ON answers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view answers" ON answers
  FOR SELECT USING (
    submission_id IN (
      SELECT id FROM submissions
      WHERE staff_id IN (
        SELECT id FROM staff
        WHERE organization_id IN (
          SELECT organization_id FROM admins WHERE user_id = auth.uid()
        )
      )
    )
  );
