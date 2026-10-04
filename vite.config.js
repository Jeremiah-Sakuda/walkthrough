import { defineConfig } from 'vite';
export default defineConfig({ server: { strictPort: true, watch: {usePolling: true}, proxy: { '/api': 'http://127.0.0.1:3103' } } });
