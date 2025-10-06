const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  // 開発時のキャッシュを無効化
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
};

export default nextConfig;
