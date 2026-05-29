import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "N4/N5 日文練習",
  description: "JLPT N5 and N4 curated vocabulary practice cards and quizzes.",
  applicationName: "N4/N5 日文練習",
  appleWebApp: {
    capable: true,
    title: "N4/N5 日文練習",
  },
};

export const viewport: Viewport = {
  themeColor: "#fffaf2",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
