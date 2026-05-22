import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Raises the warning threshold to 1.5MB to accommodate 3D graphics
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Splits massive 3D modules into separate files so the browser loads faster
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
