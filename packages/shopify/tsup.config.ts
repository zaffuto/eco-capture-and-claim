import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  splitting: false,
  external: ['@eco/database', '@shopify/app-bridge', 'react', 'react-dom'],
  noExternal: ['@eco/shared'],
});
