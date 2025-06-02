import path from "path"
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react'
    ],
    exclude: [],
    esbuildOptions: {
      sourcemap: false
    }
  },
  // 개발 서버 설정
  server: {
    cors: {
      origin: '*',
      credentials: true
    },
    headers: {
      // Allow SharedArrayBuffer for WebContainer
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    },
    // API 서버로 프록시 설정
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    // Change the output .js filename to not include a hash
    rollupOptions: {
      // external: ["vscode-webview"],
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@microblog": path.resolve(__dirname, "./my-mfe-project/microblog-lms"),
      "components": path.resolve(__dirname, "./components"),
      "@ide": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  // Node.js의 process 객체를 브라우저에서 모방
  define: {
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      STORYBOOK: JSON.stringify(process.env.STORYBOOK || 'false'),
    },
    // 클라이언트 측에서 process가 정의되지 않은 경우를 위한 폴백
    'process': {
      'env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        STORYBOOK: JSON.stringify(process.env.STORYBOOK || 'false'),
      }
    }
  },
});
