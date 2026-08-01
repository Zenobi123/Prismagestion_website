ALTER TABLE public.courriers
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS mission_doc_type TEXT;

CREATE INDEX IF NOT EXISTS idx_courriers_task_id ON public.courriers(task_id);