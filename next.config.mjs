/** @type {import('next').NextConfig} */
const nextConfig = {
  // Route API traffic to the Python serverless function (`api/index.py` → served at `/api` on Vercel).
  // Defined here instead of `vercel.json` so the deployment is unambiguously a Next.js app (no static-site preset).
  async rewrites() {
    return [
      { source: "/health", destination: "/api" },
      { source: "/v1/:path*", destination: "/api" },
    ];
  },
};

export default nextConfig;
