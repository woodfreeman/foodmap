"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AddPinForm({
  picked,
  onAdded,
  onCancel,
}: {
  picked: { lat: number; lng: number } | null;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [shop, setShop] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setErr("");
    if (!picked) {
      setErr("请先在地图上点选一个位置");
      return;
    }
    if (!name.trim()) {
      setErr("请填写菜名");
      return;
    }
    setBusy(true);
    try {
      let imageUrl: string | null = null;
      if (file) {
        const path = `public/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("food-images")
          .upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("food-images").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }
      const { error } = await supabase.from("food_pins").insert({
        name: name.trim(),
        shop: shop.trim() || null,
        note: note.trim() || null,
        lat: picked.lat,
        lng: picked.lng,
        image_url: imageUrl,
      });
      if (error) throw error;
      onAdded();
    } catch (e: any) {
      setErr(e?.message || "提交失败");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-5 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-bold mb-3">新增美食</h2>
        {err && <p className="text-red-500 text-sm mb-2">{err}</p>}
        <p className="text-sm text-gray-500 mb-3">
          位置：
          {picked
            ? `${picked.lat.toFixed(5)}, ${picked.lng.toFixed(5)}`
            : "请在地图点选（或点右上角「定位」）"}
        </p>
        <input
          className={inputCls}
          placeholder="菜名 *"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className={inputCls}
          placeholder="店名"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
        />
        <textarea
          className={inputCls}
          placeholder="备注（推荐理由、人均等）"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mb-3 text-sm"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg bg-gray-200 text-sm"
          >
            取消
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-sm font-bold disabled:opacity-50"
          >
            {busy ? "提交中…" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
