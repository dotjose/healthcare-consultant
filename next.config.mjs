/** @type {import('next').NextConfig} */
const nextConfig = {
  // No `output: "export"` — this must stay a server-side Next.js app (.next output).
  // API rewrites for FastAPI live in `vercel.json` (single source of truth for the hybrid deploy).
};

export default nextConfig;
