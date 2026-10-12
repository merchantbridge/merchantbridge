const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");

module.exports = {
  typescript: { ignoreBuildErrors: true },
  experimental: { useTypeScriptCli: false },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = false;
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/videos/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

initOpenNextCloudflareForDev();
