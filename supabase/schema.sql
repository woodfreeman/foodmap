-- ============================================================
-- 美食地图 FoodMap — Supabase 数据层
-- 在 Supabase 后台「SQL Editor」里新建查询，整段粘贴执行。
-- MVP 不做登录：所有人可读、可写（与课程一致）。
-- 生产环境若要限制，请改为基于 auth.uid() 的 policy。
-- ============================================================

-- 1) 美食点表
create table if not exists public.food_pins (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  shop        text,
  lat         double precision not null,
  lng         double precision not null,
  note        text,
  image_url   text,
  created_at  timestamptz default now()
);

create index if not exists food_pins_created_at_idx
  on public.food_pins (created_at desc);

-- 2) 开启行级安全（RLS）
alter table public.food_pins enable row level security;

-- 3) MVP 公开策略：任何人可读、可插入
drop policy if exists "public read food_pins" on public.food_pins;
create policy "public read food_pins"
  on public.food_pins for select
  using (true);

drop policy if exists "public insert food_pins" on public.food_pins;
create policy "public insert food_pins"
  on public.food_pins for insert
  with check (true);

-- 4) 图片存储桶 food-images（Public）
--    方式 A：下面这条 SQL（以项目 owner 执行通常可用）
insert into storage.buckets (id, name, public)
values ('food-images', 'food-images', true)
on conflict (id) do nothing;

--    方式 B（更稳）：去 Supabase「Storage」页面 → New bucket
--    → 名称填 food-images → 勾选 Public → Create

-- 5) 存储桶公开读写策略（MVP 允许匿名上传）
drop policy if exists "public read food-images" on storage.objects;
create policy "public read food-images"
  on storage.objects for select
  using (bucket_id = 'food-images');

drop policy if exists "public insert food-images" on storage.objects;
create policy "public insert food-images"
  on storage.objects for insert
  with check (bucket_id = 'food-images');
