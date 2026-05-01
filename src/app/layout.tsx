import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoupleDating",
  description: "홍대, 합정, 연남, 망원 데이트 중 다음 행동을 빠르게 고르는 모바일 MVP",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full bg-zinc-100 text-zinc-950">{children}</body>
    </html>
  );
}
