import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 锁定工作区根目录为本项目，避免 Next 把上层目录的 package-lock.json 误当根
  turbopack: {
    root: process.cwd(),
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // 按需优化大型库的具名导入，缩小首屏打包体积
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "radix-ui"],
  },
  // 生产构建移除 console.*（保留 error）
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
