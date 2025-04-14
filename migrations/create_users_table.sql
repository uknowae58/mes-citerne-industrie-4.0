-- Description: Create users table for storing user profile information
-- Created: 2023-07-06

-- SQL statement below
create table public.users (
  id uuid not null default extensions.uuid_generate_v4 (),
  username text not null,
  email text not null,
  firstname text null,
  lastname text null,
  photo_url text null,
  created_at timestamp with time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp with time zone null default CURRENT_TIMESTAMP,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

create trigger update_users_updated_at BEFORE
update on users for EACH row
execute FUNCTION update_updated_at_column (); 