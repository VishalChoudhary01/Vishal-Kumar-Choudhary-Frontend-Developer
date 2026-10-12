/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,

    /* NEXT_DIST_DIR lets a verification build run beside a live `next dev`
       without either one clobbering the shared .next directory. Unset (the
       normal case) this is a no-op. */
    distDir: process.env.NEXT_DIST_DIR || ".next",

    images: {
        formats: ["image/avif", "image/webp"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        /* quality 90 is intentionally used by ProjectHeroVisual (project
           detail hero photography); allow it to silence the runtime
           "not configured in images.qualities" warning. */
        qualities: [75, 90],
    },

    async headers() {
        return [
            {
                source: "/images/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, max-age=31536000, immutable",
                    },
                ],
            },
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "origin-when-cross-origin",
                    },
                ],
            },
        ];
    },

    experimental: {
        optimizePackageImports: ["lucide-react"],
    },
};

export default nextConfig;
