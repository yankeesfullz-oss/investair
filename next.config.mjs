/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "photos.zillowstatic.com",
      },
      {
        protocol: "https",
        hostname: "**.fl.yelpcdn.com",
      },
    ],
  },
};

export default nextConfig;
