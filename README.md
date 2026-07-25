# 🍜 美食地图 FoodMap

基于 git源宝《Vibe Coding》Day5/Day6 实战改写的 MVP：上传美食照片 + 位置 → 地图可视化 → 所有人共享。
技术栈：**Next.js (App Router) + TypeScript + Tailwind CSS + 高德地图 JS API 2.0 + Supabase（Postgres + Storage）+ Vercel 部署**。

> 注意：课程转写把 Vercel 误识别成 "Worso"、Supabase 误识别成 "SuperBase"、Supabase 的 SQL 编辑器误识别成 "Circle 编辑器"，本文已纠正。

---

## 一、准备三个账号 / key（一次性）

### 1. 高德地图 JS API key（地图渲染必需）
1. 打开 https://lbs.amap.com/ → 注册并实名
2. 控制台 → **应用管理 → 我的应用 → 创建应用**
3. 添加 key：服务平台选 **Web端 (JS API)**
4. 拿到 **key** 和 **安全密钥（securityJsCode）**
   - 安全密钥在 key 列表的「安全密钥」一栏（2021 年后高德要求配套）

### 2. Supabase（数据库 + 图片存储，免费层够用）
1. 打开 https://supabase.com/ → 注册 → **New project**
2. 填项目名、设数据库密码（记好），区域任选
3. 等项目建好 → **SQL Editor** → 新建查询 → 把仓库 `supabase/schema.sql` 整段粘贴执行
   - 会建 `food_pins` 表 + 开启 RLS + 公开读写 policy + `food-images` 桶
   - 若建桶 SQL 报错，按 `supabase/STORAGE.md` 在 Storage 页面手动建（名称 `food-images`、勾 Public）
4. **Settings → API** 复制 **Project URL** 和 **anon public** key

### 3. Vercel + GitHub（部署必需）
- Vercel 从 GitHub 仓库拉代码自动部署，所以先把代码 push 到 GitHub（见第四节）
- Vercel 账号用 GitHub 登录即可

---

## 二、本地配置

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 用编辑器打开 .env.local，填入上面拿到的四个值：
#   NEXT_PUBLIC_AMAP_KEY
#   NEXT_PUBLIC_AMAP_SECURITY_CODE
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. 本地开发
npm run dev
# 打开 http://localhost:3000
```

本地 `localhost` 下「定位」按钮（浏览器 geolocation）也可用，方便先测功能。

---

## 三、怎么用

- 首页是全屏地图 + 底部美食列表
- 点右上「**定位**」自动获取当前位置，或**直接在地图上点一下**选点
- 点「**+ 新增**」：填菜名（必填）/ 店名 / 备注，可选上传照片 → 保存
- 保存后地图出现标记，点标记弹详情（图 + 菜名 + 店名 + 备注）
- 所有人的新增实时共享（数据在 Supabase，不只在你本地）

---

## 四、部署到 Vercel

> 本项目已 `git init` 并提交在 `main` 分支（1 个 commit，库内无 node_modules/.next）。

### 1. 前置（GitHub 侧，一次性）
- **加 SSH 公钥到 GitHub**：Settings → SSH and GPG keys → New SSH key，粘贴本机 `~/.ssh/id_ed25519.pub`（本机默认 key 注释为 `csm-voice-io-2026-06-17`）。没加的话 `git push` 会 `Permission denied (publickey)`。
- **建空仓库 `woodfreeman/foodmap`**：GitHub → New repository，仓库名 `foodmap`、保持 **空**（别勾 Initialize with README），否则和本地历史冲突。

### 2. 推送代码
```bash
git remote add origin git@github.com:woodfreeman/foodmap.git
git push -u origin main
```

### 3. 导入 Vercel（二选一）
**一键导入**（push 成功后直接点，已预填 4 个环境变量名）：
https://vercel.com/new/clone?repository-url=https://github.com/woodfreeman/foodmap&env=NEXT_PUBLIC_AMAP_KEY,NEXT_PUBLIC_AMAP_SECURITY_CODE,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=foodmap&framework=nextjs
> **值**需在 Vercel 项目 Settings → Environment Variables 里填（值同 `.env.local`，模板见 `vercel-env.example`）。

**手动导入**（等价）：
1. https://vercel.com/ → **Add New → Project** → 导入 `woodfreeman/foodmap`
2. Framework 选 **Next.js**（`vercel.json` 已声明，自动识别）
3. **Environment Variables** 把 `vercel-env.example` 里 4 个变量原样填一遍
4. 点 **Deploy** → 拿到 `https://foodmap-xxxx.vercel.app`

### 关键提醒
- **环境变量要在 Vercel 也填一份**，只填本地 `.env.local` 不够，Vercel 构建/运行读不到
- **「定位」功能需要 HTTPS**：Vercel 域名自带 HTTPS，没问题；本地 `localhost` 也允许
- 高德 JS API 的 key 若设了「域名白名单」，记得把 `*.vercel.app` 加进去（或先不设白名单测通）
- 部署区域设为 **香港 (hkg1)**（`vercel.json` 已指定），离海口更近

---

## 五、目录结构

```
foodmap/
├── package.json
├── next.config.mjs
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example
├── vercel.json
├── vercel-env.example
├── README.md
├── supabase/
│   ├── schema.sql        # 建表 + RLS + Storage policy（去 SQL Editor 执行）
│   └── STORAGE.md        # 建桶与拿 key 说明
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx       # 首页：地图 + 列表 + 新增入口
    │   └── globals.css
    ├── components/
    │   ├── MapView.tsx    # 高德地图加载 + marker + 点选
    │   └── AddPinForm.tsx # 新增表单 + 图片上传 Supabase
    └── lib/
        ├── supabase.ts    # Supabase 客户端
        └── types.ts       # FoodPin 类型
```

---

## 六、可扩展方向（课程留的作业精神）

- 登录 / 用户隔离（Supabase Auth + 改 policy 为 `auth.uid()`）
- 分类标签、评分、搜索
- 图片压缩 / 多图
- 地图聚合（点多了用高德点聚合）
