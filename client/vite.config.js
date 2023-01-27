/* eslint-disable import/no-extraneous-dependencies */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const path = require('path');
/* eslint-enable import/no-extraneous-dependencies */

// https://vitejs.dev/config/
export default defineConfig({
  base: '/governance/hexagon/',
  css: {
    preprocessorOptions: {
      scss: {
        additionalData:
          '/* auto injected code > */ @import "./src/styles/_main.scss"; /* auto injected code < */',
        sassOptions: {
          outputStyle: 'compressed',
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      api: path.resolve(__dirname, 'src/api'),
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
      constants: path.resolve(__dirname, 'src/constants'),
      context: path.resolve(__dirname, 'src/context'),
      env: path.resolve(__dirname, 'src/env'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      layouts: path.resolve(__dirname, 'src/layouts'),
      mocks: path.resolve(__dirname, 'src/mocks'),
      routes: path.resolve(__dirname, 'src/routes'),
      services: path.resolve(__dirname, 'src/services'),
      store: path.resolve(__dirname, 'src/store'),
      styles: path.resolve(__dirname, 'src/styles'),
      svg: path.resolve(__dirname, 'src/svg'),
      types: path.resolve(__dirname, 'src/types'),
      utils: path.resolve(__dirname, 'src/utils'),
      views: path.resolve(__dirname, 'src/views'),
    },
  },
});
