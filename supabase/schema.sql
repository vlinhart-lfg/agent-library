create table templates (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users default auth.uid(),
  title text not null,
  slug text not null unique,
  description text,
  full_description text,
  category text,
  complexity text,
  use_case text,
  tags text[],
  make_scenario_url text,
  make_scenario_id text,
  make_iframe_url text,
  make_apps text[],
  app_icons jsonb,
  preview_image text,
  submitted_by text,
  status text default 'published',
  ai_enhanced boolean default false
);

-- Enable Row Level Security
alter table templates enable row level security;

-- Create policies
create policy "Public templates are viewable by everyone."
  on templates for select
  using ( true );

create policy "Users can insert their own templates."
  on templates for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own templates."
  on templates for update
  using ( auth.uid() = user_id );
