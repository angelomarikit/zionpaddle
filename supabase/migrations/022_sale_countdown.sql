-- Per-product urgency sale countdown (storefront PDP).
alter table products
  add column if not exists sale_countdown_enabled boolean not null default false;

alter table products
  add column if not exists sale_countdown_mode text not null default 'fixed';

alter table products
  add column if not exists sale_countdown_ends_at timestamptz;

alter table products
  add column if not exists sale_countdown_rolling_minutes int;

alter table products
  add column if not exists sale_countdown_headline text;

comment on column products.sale_countdown_mode is 'fixed = ends_at; rolling = restarts every rolling_minutes on the client.';
comment on column products.sale_countdown_rolling_minutes is 'Minutes per cycle when mode is rolling (e.g. 5).';