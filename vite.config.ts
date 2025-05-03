import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { verifyClone } from './src/api/verify';
import type { Connect } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/verify': {
        target: 'http://localhost',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', async (proxyReq, req: Connect.IncomingMessage, res) => {
            const response = await verifyClone(req as unknown as Request);
            const headers = Object.fromEntries(response.headers.entries());
            
            res.writeHead(response.status, headers);
            res.end(await response.arrayBuffer());
          });
        }
      }
    }
  },
});
