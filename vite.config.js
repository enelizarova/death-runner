import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    base: './',
    plugins: [vue(), tailwindcss()],
    server: {
        host: '127.0.0.1',
        port: 5173,
        strictPort: true,
        open: true,
    },
    build: {
        emptyOutDir: true,
    },
});
