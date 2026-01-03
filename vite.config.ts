/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { resolve } from 'path';

const appDir = __dirname;
const assetsDir = resolve(appDir, 'assets');
const publicDir = resolve(appDir, 'public');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    publicDir: false, // Don't copy public dir, Hugo handles that
    plugins: [
        preact(),
    ],
    resolve: {
        alias: {
            'js': resolve(assetsDir, 'js'),
            '/assets': assetsDir,
        }
    },
    build: {
        outDir: resolve(publicDir, 'assets'),
        emptyOutDir: true,
        manifest: false,
        rollupOptions: {
            input: {
                romsWidget: resolve(assetsDir, 'js/romsWidget.tsx'),
            },
            output: {
                entryFileNames: 'js/[name].js',
                chunkFileNames: 'js/[name]-[hash].js',
                assetFileNames: '[ext]/[name].[ext]'
            }
        },
        // In watch mode, build incrementally
        watch: mode === 'development' ? {
            include: ['assets/**/*']
        } : null
    }
}));
