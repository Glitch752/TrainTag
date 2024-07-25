import rawPlugin from 'vite-raw-plugin';
import mkcert from 'vite-plugin-mkcert';

export default {
  plugins: [
    rawPlugin({
      fileRegex: /\.wgsl$/,
    }),
    mkcert()
  ],

  server: {
    port: 8080,
    https: true,
    proxy: {
      "/ws": {
        target: 'ws://localhost:5174',
        ws: true,
        // Exercise caution using `rewriteWsOrigin` as it can leave the proxying open to CSRF attacks.
        rewriteWsOrigin: true,
      }
    },
    
    host: true
  }
};
