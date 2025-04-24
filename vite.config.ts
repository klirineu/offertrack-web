import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { verifyClone } from './src/api/verify';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    middleware: [
      {
        name: 'verify-clone',
        handle: async (req, res, next) => {
          if (req.url?.startsWith('/api/verify')) {
            const response = await verifyClone(req as unknown as Request);
            const headers = Object.fromEntries(response.headers.entries());
            
            res.writeHead(response.status, headers);
            res.end(await response.arrayBuffer());
            return;
          }
          next();
        },
      },
    ],
  },
});
