import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/game",
  assetPrefix: "/game",
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/game",
        permanent: false,
      },
    ];
  }
};

export default nextConfig;
