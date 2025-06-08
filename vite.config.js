import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'favicon.ico',
                'favicon.svg',
                'apple-touch-icon.png',
                'masked-icon.svg',
            ],
            manifest: {
                name: 'AmbientFlow',
                short_name: 'AmbientFlow',
                description: 'Ambient sound mixing application for focus and relaxation',
                theme_color: '#3b82f6',
                background_color: '#0a0a0f',
                display: 'standalone',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,ogg,wav}'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-cache',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:mp3|ogg|wav)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'audio-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                            },
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                            rangeRequests: true,
                        },
                    },
                    {
                        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'image-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                            },
                        },
                    },
                    {
                        urlPattern: /\.(?:js|css)$/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'static-resources',
                            expiration: {
                                maxEntries: 60,
                                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                            },
                        },
                    },
                ],
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true,
                navigateFallback: 'index.html',
                navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
            },
        }),
    ],
    // PWA ready settings
    clearScreen: false,
    server: {
        port: 5173,
        strictPort: true,
    },
    envPrefix: ['VITE_'],
    build: {
        outDir: 'dist',
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        sourcemap: false,
        rollupOptions: {
            output: {
                // Optimize for Cloudflare Pages
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    audio: ['howler'],
                    ui: ['lucide-react'],
                    pwa: ['workbox-window'],
                    utils: ['zustand', 'web-vitals'],
                },
                // Improve cache efficiency
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name?.split('.') || [];
                    let extType = info[info.length - 1];
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                        extType = 'img';
                    }
                    else if (/mp3|ogg|wav|flac/i.test(extType)) {
                        extType = 'audio';
                    }
                    return `assets/${extType}/[name]-[hash][extname]`;
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
            },
        },
        // Performance optimizations for Cloudflare
        cssCodeSplit: true,
        chunkSizeWarningLimit: 1000,
        // Optimize for edge deployment
        target: 'es2020',
        reportCompressedSize: false,
        assetsInlineLimit: 4096, // Inline small assets
    },
});
