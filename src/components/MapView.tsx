"use client";

import { useEffect, useRef } from "react";
import type { FoodPin } from "@/lib/types";

const AMAP_KEY = process.env.NEXT_PUBLIC_AMAP_KEY as string;
const AMAP_SECURITY = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE as string;

// 默认中心：海口（可按需改）
const DEFAULT_CENTER: [number, number] = [110.33, 20.04];

export default function MapView({
  pins,
  onPick,
  picked,
}: {
  pins: FoodPin[];
  onPick?: (lat: number, lng: number) => void;
  picked?: { lat: number; lng: number } | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const pickedMarkerRef = useRef<any>(null);

  // 初始化地图（仅一次）
  useEffect(() => {
    if (!AMAP_KEY) {
      console.warn("[foodmap] 缺少 NEXT_PUBLIC_AMAP_KEY");
      return;
    }
    (window as any)._AMapSecurityConfig = { securityJsCode: AMAP_SECURITY };
    let destroyed = false;
    import("@amap/amap-jsapi-loader")
      .then((mod: any) =>
        mod.default.load({
          key: AMAP_KEY,
          version: "2.0",
          plugins: ["AMap.Scale", "AMap.ToolBar"],
        })
      )
      .then((AMap: any) => {
        if (destroyed || !containerRef.current) return;
        const map = new AMap.Map(containerRef.current, {
          zoom: 11,
          center: DEFAULT_CENTER,
        });
        map.addControl(new AMap.Scale());
        map.addControl(new AMap.ToolBar());
        mapRef.current = map;
        map.on("click", (e: any) => {
          if (onPick) onPick(e.lnglat.getLat(), e.lnglat.getLng());
        });
      })
      .catch((err: any) => console.error("[foodmap] 高德加载失败", err));
    return () => {
      destroyed = true;
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  // 渲染所有美食点 marker
  useEffect(() => {
    const AMap = (window as any).AMap;
    if (!AMap || !mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    pins.forEach((p) => {
      const marker = new AMap.Marker({
        position: [p.lng, p.lat],
        title: p.name,
      });
      marker.on("click", () => {
        const html = `<div style="padding:8px;max-width:220px">
          ${p.image_url ? `<img src="${p.image_url}" style="width:200px;border-radius:8px;margin-bottom:6px"/>` : ""}
          <b>${escapeHtml(p.name)}</b><br/>
          ${p.shop ? "店名：" + escapeHtml(p.shop) + "<br/>" : ""}
          ${p.note ? "备注：" + escapeHtml(p.note) : ""}
        </div>`;
        const info = new AMap.InfoWindow({
          content: html,
          offset: new AMap.Pixel(0, -30),
        });
        info.open(mapRef.current, [p.lng, p.lat]);
      });
      marker.setMap(mapRef.current);
      markersRef.current.push(marker);
    });
  }, [pins]);

  // 选中点（新增时）标记
  useEffect(() => {
    const AMap = (window as any).AMap;
    if (!AMap || !mapRef.current) return;
    if (pickedMarkerRef.current) {
      pickedMarkerRef.current.setMap(null);
      pickedMarkerRef.current = null;
    }
    if (!picked) return;
    pickedMarkerRef.current = new AMap.Marker({
      position: [picked.lng, picked.lat],
      icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
    });
    pickedMarkerRef.current.setMap(mapRef.current);
    mapRef.current.setCenter([picked.lng, picked.lat]);
  }, [picked]);

  return <div ref={containerRef} id="map" />;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string;
  });
}
