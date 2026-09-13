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
  metadataBase: new URL("https://tankyu.academy"),
  title: "TLA | 問いを、社会を動かすプロジェクトへ。",
  description: "TLAは、AIと探究の専門家が、企業・自治体・教育機関の課題を構想から社会実装まで伴走する団体です。",
  openGraph: {
    title: "TLA | 問いを、社会を動かすプロジェクトへ。",
    description: "企業・自治体・教育機関の課題を、構想から社会実装まで。",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "TLA - 問いを、社会を動かすプロジェクトへ。" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TLA | 問いを、社会を動かすプロジェクトへ。",
    description: "企業・自治体・教育機関の課題を、構想から社会実装まで。",
    images: ["/og.png"],
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
        {children}
      </body>
    </html>
  );
}
