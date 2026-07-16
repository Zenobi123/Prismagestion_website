-- Activer le temps réel pour les tables auxquelles le frontend s'abonne
alter publication supabase_realtime add table public.blog_posts;
alter publication supabase_realtime add table public.services;
alter publication supabase_realtime add table public.contact_config;
alter publication supabase_realtime add table public.site_sections;
alter publication supabase_realtime add table public.contact_messages;
alter publication supabase_realtime add table public.quote_requests;
alter publication supabase_realtime add table public.appointments;
