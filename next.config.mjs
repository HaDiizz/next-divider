// next.config.mjs
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  env: {
    BASE_URL: "https://bunchee.vercel.app",
  },
};

export default withPWA({
  dest: "public",
})(nextConfig);
