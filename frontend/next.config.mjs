/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
      HOSTNAME: process.env.HOSTNAME,
    }
  };

export default nextConfig;
