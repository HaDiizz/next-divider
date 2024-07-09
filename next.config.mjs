// next.config.mjs
import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
};

export default withPWA({
  dest: "public",
})(nextConfig);
