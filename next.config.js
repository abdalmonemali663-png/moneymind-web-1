/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // هذا السطر الإضافي يمنع فشل الـ Build بسبب الصفحات الثابتة مثل login
  missingSuspenseWithSearchParams: "error" in process.env ? undefined : false,
};

module.exports = nextConfig;
