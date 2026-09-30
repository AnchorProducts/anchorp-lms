/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: "/admin/sop", destination: "/admin/settings", permanent: false },
    ];
  },
};

export default nextConfig;
