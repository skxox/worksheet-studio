import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 锁定工作区根目录为本项目，避免 Next 把上层目录的 package-lock.json 误当根
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
