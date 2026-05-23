-- =============================================================
-- Cidade Conectada — Supabase Schema
-- Execute este arquivo no SQL Editor do Supabase Dashboard
-- =============================================================

-- ----------------------------------------------------------------
-- 1. PROFILES TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  uid         text        GENERATED ALWAYS AS (id::text) STORED,
  "fullName"  text        NOT NULL,
  email       text        NOT NULL,
  whatsapp    text        NOT NULL DEFAULT '',
  role        text        NOT NULL DEFAULT 'comum'
                          CHECK (role IN ('comum', 'adm', 'gestor')),
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode ler perfis (para exibir nome em denúncias)
CREATE POLICY "profiles_select_auth" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- Cada usuário só pode inserir/atualizar o próprio perfil
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Gestor pode atualizar role de qualquer perfil
CREATE POLICY "profiles_update_gestor" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'gestor'
    )
  );

-- Gestor pode deletar perfis (exceto outros gestores)
CREATE POLICY "profiles_delete_gestor" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'gestor'
    )
    AND role != 'gestor'
  );

-- ----------------------------------------------------------------
-- 2. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, "fullName", email, whatsapp, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'whatsapp', ''),
    'comum'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------
-- 3. REPORTS TABLE
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id            text        PRIMARY KEY,
  protocol      text        NOT NULL UNIQUE,
  "userId"      text        NOT NULL,
  "userName"    text        NOT NULL,
  "userWhatsapp" text       NOT NULL DEFAULT '',
  description   text        NOT NULL DEFAULT '',
  "photoUrl"    text        NOT NULL DEFAULT '',
  category      text        NOT NULL
                            CHECK (category IN ('entulho','lampada','buraco','lixo','vazamento','esgoto','outros')),
  status        text        NOT NULL DEFAULT 'recebido'
                            CHECK (status IN ('recebido','analise','andamento','resolvido')),
  latitude      numeric,
  longitude     numeric,
  address       text        NOT NULL DEFAULT '',
  "createdAt"   timestamptz NOT NULL DEFAULT now(),
  "updatedAt"   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Leitura pública (qualquer um pode ver denúncias)
CREATE POLICY "reports_select_public" ON public.reports
  FOR SELECT USING (true);

-- Apenas usuários autenticados podem criar
CREATE POLICY "reports_insert_auth" ON public.reports
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND "userId" = (auth.uid())::text
  );

-- Dono pode atualizar apenas campos não-administrativos (não pode mudar status)
-- Adm e Gestor podem atualizar tudo
CREATE POLICY "reports_update_adm" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('adm', 'gestor')
    )
  );

CREATE POLICY "reports_update_owner" ON public.reports
  FOR UPDATE USING ("userId" = (auth.uid())::text)
  WITH CHECK (status = OLD.status);  -- dono não pode mudar status

-- Apenas adm/gestor podem deletar
CREATE POLICY "reports_delete_adm" ON public.reports
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('adm', 'gestor')
    )
  );

-- ----------------------------------------------------------------
-- 4. STORAGE — bucket para fotos de denúncias
-- ----------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "report_photos_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'report-photos');

CREATE POLICY "report_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'report-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "report_photos_delete_adm" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'report-photos'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('adm', 'gestor')
    )
  );

-- ----------------------------------------------------------------
-- 5. DEMO ADMIN
-- Após rodar este SQL, crie manualmente no Supabase Dashboard:
--   Auth > Users > Add User
--   Email: admin@igarassu.pe.gov.br  Senha: admin123
-- Depois execute:
--   UPDATE public.profiles SET role = 'adm'
--   WHERE email = 'admin@igarassu.pe.gov.br';
-- ----------------------------------------------------------------
