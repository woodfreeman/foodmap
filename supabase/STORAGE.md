# Supabase Storage 配置说明

美食照片存在 Supabase Storage 的 `food-images` 桶里，桶设为 **Public**，这样任何人都能直接看图片 URL。

## 步骤

1. 打开 Supabase 后台 → **Storage** 页面
2. 点 **New bucket**
3. Name 填 `food-images`
4. 勾选 **Public bucket**（公开读取）
5. 点 **Create**

（也可直接在 SQL Editor 执行仓库里 `supabase/schema.sql`，其中已包含建桶语句。）

## 权限

schema.sql 里已经建好两条 Storage policy：
- `public read food-images`：任何人可读该桶对象
- `public insert food-images`：任何人可上传到该桶（MVP 免登录；要限制就改成基于 `auth.uid()`）

## 拿到 API 凭证

1. Supabase 后台 → **Settings** → **API**
2. 复制 **Project URL**（形如 `https://xxxx.supabase.co`）
3. 复制 **anon public** key（以 `eyJ` 开头）
4. 填到项目的 `.env.local`（见 `.env.example`）：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
