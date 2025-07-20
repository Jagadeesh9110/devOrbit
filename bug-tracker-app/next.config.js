/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    // Ensure native packages like `onnxruntime-node` are treated properly
    serverComponentsExternalPackages: [
      "onnxruntime-node",
      "@xenova/transformers",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prevent bundling native .node binaries
      config.externals.push({
        "onnxruntime-node": "commonjs onnxruntime-node",
        sharp: "commonjs sharp",
      });
    }

    return config;
  },
};

module.exports = nextConfig;
