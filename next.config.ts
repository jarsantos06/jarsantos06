import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uploads de foto/evidência são servidos a partir de /public/uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
