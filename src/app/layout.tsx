import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "組織風土アセスメント (Demo)",
  description: "組織風土や働きがいに関するアセスメントフォームです。（ポートフォリオ用デモ）",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="sticky top-0 z-50 bg-yellow-100 text-yellow-900 text-xs sm:text-sm text-center py-2 px-4 border-b border-yellow-300">
          🚧 <strong>Demo mode</strong> — No data is submitted. This is a
          portfolio version of a production app. /{" "}
          <strong>デモ環境</strong>：データは保存されません。
        </div>
        {children}
      </body>
    </html>
  );
}
