
-- Roles enum
CREATE TYPE public.app_role AS ENUM (
  'patron', 'chairperson', 'vice_chairperson', 'speaker', 'deputy_speaker',
  'general_secretary', 'assistant_general_secretary', 'secretary_finance',
  'secretary_welfare', 'secretary_health', 'secretary_women_affairs',
  'secretary_publicity', 'secretary_pwd', 'electoral_commission'
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION public.is_councillor(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) $$;

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  profile_pic_url TEXT,
  class TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Student Voices
CREATE TABLE public.student_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('projects', 'ideas', 'complaints')),
  file_url TEXT,
  submitted_by TEXT,
  submitted_class TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  evaluated_by UUID REFERENCES auth.users(id),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.student_voices ENABLE ROW LEVEL SECURITY;

-- Issues
CREATE TABLE public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  raised_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Rotas
CREATE TABLE public.rotas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week TEXT NOT NULL,
  duties JSONB NOT NULL DEFAULT '[]',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rotas ENABLE ROW LEVEL SECURITY;

-- Programmes
CREATE TABLE public.programmes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.programmes ENABLE ROW LEVEL SECURITY;

-- Documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Requisitions
CREATE TABLE public.requisitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.requisitions ENABLE ROW LEVEL SECURITY;

-- Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  class TEXT NOT NULL,
  profile_pic TEXT,
  average_score NUMERIC NOT NULL,
  application_pdf TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'qualified', 'disqualified')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Ballots
CREATE TABLE public.ballots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_title TEXT NOT NULL,
  candidates_json JSONB NOT NULL DEFAULT '[]',
  pdf_url TEXT,
  editable BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ballots ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_voices_updated_at BEFORE UPDATE ON public.student_voices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON public.issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rotas_updated_at BEFORE UPDATE ON public.rotas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_programmes_updated_at BEFORE UPDATE ON public.programmes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_requisitions_updated_at BEFORE UPDATE ON public.requisitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ballots_updated_at BEFORE UPDATE ON public.ballots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Profiles viewable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can submit student voice" ON public.student_voices FOR INSERT WITH CHECK (true);
CREATE POLICY "Councillors can view student voices" ON public.student_voices FOR SELECT USING (public.is_councillor(auth.uid()));
CREATE POLICY "Evaluators can update student voices" ON public.student_voices FOR UPDATE USING (
  public.has_role(auth.uid(), 'general_secretary') OR public.has_role(auth.uid(), 'assistant_general_secretary') OR public.has_role(auth.uid(), 'chairperson') OR public.has_role(auth.uid(), 'patron')
);
CREATE POLICY "Councillors view issues" ON public.issues FOR SELECT USING (public.is_councillor(auth.uid()));
CREATE POLICY "Councillors create issues" ON public.issues FOR INSERT WITH CHECK (public.is_councillor(auth.uid()) AND auth.uid() = raised_by);
CREATE POLICY "Leadership update issues" ON public.issues FOR UPDATE USING (
  public.has_role(auth.uid(), 'chairperson') OR public.has_role(auth.uid(), 'patron') OR public.has_role(auth.uid(), 'general_secretary')
);
CREATE POLICY "Councillors view rotas" ON public.rotas FOR SELECT USING (public.is_councillor(auth.uid()));
CREATE POLICY "Asst gen sec manages rotas" ON public.rotas FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'assistant_general_secretary'));
CREATE POLICY "Asst gen sec updates rotas" ON public.rotas FOR UPDATE USING (public.has_role(auth.uid(), 'assistant_general_secretary'));
CREATE POLICY "Asst gen sec deletes rotas" ON public.rotas FOR DELETE USING (public.has_role(auth.uid(), 'assistant_general_secretary'));
CREATE POLICY "Councillors view programmes" ON public.programmes FOR SELECT USING (public.is_councillor(auth.uid()));
CREATE POLICY "Editors create programmes" ON public.programmes FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'general_secretary') OR public.has_role(auth.uid(), 'secretary_publicity')
);
CREATE POLICY "Editors update programmes" ON public.programmes FOR UPDATE USING (
  public.has_role(auth.uid(), 'general_secretary') OR public.has_role(auth.uid(), 'secretary_publicity')
);
CREATE POLICY "Councillors view documents" ON public.documents FOR SELECT USING (public.is_councillor(auth.uid()));
CREATE POLICY "Councillors upload documents" ON public.documents FOR INSERT WITH CHECK (public.is_councillor(auth.uid()) AND auth.uid() = uploaded_by);
CREATE POLICY "Councillors view requisitions" ON public.requisitions FOR SELECT USING (public.is_councillor(auth.uid()));
CREATE POLICY "Councillors create requisitions" ON public.requisitions FOR INSERT WITH CHECK (public.is_councillor(auth.uid()) AND auth.uid() = requested_by);
CREATE POLICY "Finance Patron approve requisitions" ON public.requisitions FOR UPDATE USING (
  public.has_role(auth.uid(), 'secretary_finance') OR public.has_role(auth.uid(), 'patron')
);
CREATE POLICY "EC view applications" ON public.applications FOR SELECT USING (
  public.has_role(auth.uid(), 'electoral_commission') OR public.has_role(auth.uid(), 'chairperson') OR public.has_role(auth.uid(), 'patron')
);
CREATE POLICY "EC manage applications" ON public.applications FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'electoral_commission') OR public.has_role(auth.uid(), 'chairperson') OR public.has_role(auth.uid(), 'patron')
);
CREATE POLICY "EC update applications" ON public.applications FOR UPDATE USING (
  public.has_role(auth.uid(), 'electoral_commission') OR public.has_role(auth.uid(), 'chairperson') OR public.has_role(auth.uid(), 'patron')
);
CREATE POLICY "EC view ballots" ON public.ballots FOR SELECT USING (
  public.has_role(auth.uid(), 'electoral_commission') OR public.has_role(auth.uid(), 'chairperson') OR public.has_role(auth.uid(), 'patron')
);
CREATE POLICY "EC create ballots" ON public.ballots FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'electoral_commission') AND auth.uid() = created_by
);
CREATE POLICY "EC update ballots" ON public.ballots FOR UPDATE USING (public.has_role(auth.uid(), 'electoral_commission'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pics', 'profile-pics', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('student-voice-files', 'student-voice-files', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('application-files', 'application-files', false);

-- Storage policies
CREATE POLICY "Profile pics are public" ON storage.objects FOR SELECT USING (bucket_id = 'profile-pics');
CREATE POLICY "Users upload own profile pic" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-pics' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users update own profile pic" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-pics' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Councillors view docs storage" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND public.is_councillor(auth.uid()));
CREATE POLICY "Councillors upload docs storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND public.is_councillor(auth.uid()));
CREATE POLICY "Anyone upload sv files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student-voice-files');
CREATE POLICY "Councillors view sv files" ON storage.objects FOR SELECT USING (bucket_id = 'student-voice-files' AND public.is_councillor(auth.uid()));
CREATE POLICY "EC view app files" ON storage.objects FOR SELECT USING (bucket_id = 'application-files' AND (
  public.has_role(auth.uid(), 'electoral_commission') OR public.has_role(auth.uid(), 'chairperson') OR public.has_role(auth.uid(), 'patron')
));
CREATE POLICY "EC upload app files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'application-files' AND (
  public.has_role(auth.uid(), 'electoral_commission') OR public.has_role(auth.uid(), 'chairperson') OR public.has_role(auth.uid(), 'patron')
));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;
ALTER PUBLICATION supabase_realtime ADD TABLE public.student_voices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.programmes;
