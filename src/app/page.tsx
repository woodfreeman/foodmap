"use client";

import { useEffect, useState } from "react";
import MapView from "@/components/MapView";
import AddPinForm from "@/components/AddPinForm";
import { supabase } from "@/lib/supabase";
import type { FoodPin } from "@/lib/types";

export default function Home() {
  const [pins, setPins] = useState<FoodPin[]>([]);
  const [picked, setPicked] = useState<{ lat: number; lng: number } | null>(null);
  const [adding, setAdding] = useState(false);
  const [loadErr, setLoadErr] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("food_pins")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      setLoadErr(error.message);
      return;
    }
    setPins((data as FoodPin[]) || []);
  }

  useEffect(() => {
    load();
  }, []);

  function locate() {
    if (!navigator.geolocation) {
      alert("当前浏览器不支持定位");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setPicked({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (e) => alert("定位失败：" + e.message)
    );
  }

  return (
    <main className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 bg-rose-500 text-white shadow">
        <h1 className="font-bold">🍜 美食地图</h1>
        <div className="flex gap-2">
          <button
            onClick={locate}
            className="text-sm bg-white/20 px-2 py-1 rounded hover:bg-white/30"
          >
            定位
          </button>
          <button
            onClick={() => setAdding(true)}
            className="text-sm bg-white text-rose-500 px-2 py-1 rounded font-bold hover:bg-rose-50"
          >
            + 新增
          </button>
        </div>
      </header>

      {loadErr && (
        <p className="text-xs text-amber-600 bg-amber-50 px-4 py-1">
          数据加载失败：{loadErr}（检查 Supabase 配置 / 网络）
        </p>
      )}

      <div className="flex-1 relative">
        <MapView
          pins={pins}
          onPick={(lat, lng) => setPicked({ lat, lng })}
          picked={picked}
        />
      </div>

      {adding && (
        <AddPinForm
          picked={picked}
          onAdded={() => {
            setAdding(false);
            setPicked(null);
            load();
          }}
          onCancel={() => setAdding(false)}
        />
      )}

      <section className="max-h-44 overflow-auto border-t bg-white">
        {pins.length === 0 && (
          <p className="text-sm text-gray-400 p-3">还没有美食点，点「+ 新增」记录第一个吧。</p>
        )}
        {pins.map((p) => (
          <div key={p.id} className="flex gap-3 p-2 border-b text-sm">
            {p.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image_url}
                alt={p.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="min-w-0">
              <b>{p.name}</b>
              {p.shop && <span className="text-gray-500"> · {p.shop}</span>}
              {p.note && <div className="text-gray-500 truncate">{p.note}</div>}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
