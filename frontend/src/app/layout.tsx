import type { Metadata, Viewport } from "next";
import "./globals.css";
import ReactQueryProvider from "../components/providers/react-query-provider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BottomNavigation from "../components/BottomNavigation";
import { DevLoginButton } from "@/features/dev/DevLoginButton";

export const metadata: Metadata = {
  title: "방체크 - 자취방 체크리스트",
  description: "사회 초년생들을 위한 자취 매물 비교 및 의사결정 보조 서비스. 월세, 전세 매물을 꼼꼼하게 비교하고 나만의 체크리스트를 만들어보세요.",
  keywords: ["자취", "방체크", "체크리스트", "매물비교", "사회초년생", "월세", "전세"],
  authors: [{ name: "SWYP" }],
  openGraph: {
    title: "방체크 - 나만의 자취방 체크리스트",
    description: "매물 비교부터 의사결정까지, 방체크와 함께 스마트하게 자취방을 구해보세요.",
    url: "https://bangcheck.com",
    siteName: "방체크",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "방체크 - 나만의 자취방 체크리스트",
    description: "자취 매물 비교 및 의사결정 보조 서비스",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col font-['Pretendard',sans-serif]">
        <ReactQueryProvider>
          <Header />
          <main className="flex-1 flex flex-col pb-[80px] md:pb-0">
            {children}
          </main>
          <BottomNavigation />
          <Footer />
          <DevLoginButton />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
