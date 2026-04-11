-- ============================================
-- FINORA DATABASE SETUP
-- Run this in Supabase → SQL Editor → New query
-- ============================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  monthly_budget NUMERIC DEFAULT 30000,
  currency TEXT DEFAULT 'INR',
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_frequency TEXT DEFAULT 'weekly',
  theme TEXT DEFAULT 'soft-cream',
  push_enabled BOOLEAN DEFAULT TRUE,
  fcm_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('expense', 'income', 'transfer')) NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  category TEXT NOT NULL,
  note TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

-- 3. AI CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TIPS LOG TABLE
CREATE TABLE IF NOT EXISTS public.tips_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tip_type TEXT CHECK (tip_type IN ('personalised', 'market', 'education')),
  content TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips_log ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR ALL USING (auth.uid() = id);

-- TRANSACTIONS policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- AI CONVERSATIONS policies
CREATE POLICY "Users can view own conversations" ON public.ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- TIPS LOG policies
CREATE POLICY "Users can view own tips" ON public.tips_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tips" ON public.tips_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DONE! Your database is ready.
-- ============================================

-- ADD ONBOARDING COLUMNS (run this if you already ran the first SQL)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS life_stage TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS income_range TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS goal TEXT;
