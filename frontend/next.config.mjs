/** @type {import('next').NextConfig} */
const nextConfig = {
  // Traces only the dependencies each route actually needs into
  // .next/standalone — much smaller than shipping the full node_modules,
  // which matters on shared hosting (AZDIGI) with disk/inode limits.
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["sharp"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "api.qrserver.com" },
      // Vercel Blob — where album photos, avatars, and cover photos are
      // stored in production (local disk isn't persistent on Vercel).
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
