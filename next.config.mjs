/** @type {import('next').NextConfig} */
const nextConfig = {
    // 允许 webpack 继续忽略一些特定的警告
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          punycode: false, // 忽略 punycode 的警告
        };
      }
      return config;
    },
  };
  
  export default nextConfig;