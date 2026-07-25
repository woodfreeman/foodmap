import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "美食地图 FoodMap",
  description: "上传美食照片与位置，和所有人共享好吃的",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
