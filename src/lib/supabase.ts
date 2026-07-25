import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // 不在构建期抛错，运行时（浏览器）才需要；缺值时页面会提示
  console.warn("[foodmap] 缺少 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY，请在 .env.local 中配置");
}

export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder");
