import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

export const metadata: Metadata = {
  title: "سوشال من | دستیار هوشمند و تقویم محتوای شبکه‌های اجتماعی",
  description: "مدیریت یکپارچه تقویم محتوایی، تولید کپشن و ایده با هوش مصنوعی و تایید کارفرما ویژه بازار ایران",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="icon" href="/app-icon.jpg" />
        <link rel="apple-touch-icon" href="/app-icon.jpg" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body className="min-h-screen bg-[#fcfcfd] text-[#212121] antialiased selection:bg-[#3b96cc] selection:text-white">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
