/** @type {import('next').NextConfig} */
const nextConfig = {
  // 让 Vercel 构建时忽略 TypeScript & ESLint 错误
  typescript: {
    ignoreBuildErrors: true, // 忽略 TypeScript 错误
  },
  eslint: {
    ignoreDuringBuilds: true, // 忽略 ESLint 警告
  },

  // 继续自定义 Webpack 配置，避免 `punycode` 警告
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        punycode: false, // 避免 Webpack 构建时报 `punycode` 相关警告
      };
    }
    return config;
  },

  // 增强 Webpack 性能（减少构建时间）
  experimental: {
    scrollRestoration: true, // 启用滚动恢复
    optimizeCss: true, // 优化 CSS 加载
  },
};

export default nextConfig;
