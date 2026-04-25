import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // 구글 프로필 이미지
      },
      {
        protocol: 'https',
        hostname: 'ssl.pstatic.net', // 네이버 프로필 이미지
      },
      {
        protocol: 'https',
        hostname: 'www.figma.com',
      }
    ],
  },
};

export default nextConfig;
