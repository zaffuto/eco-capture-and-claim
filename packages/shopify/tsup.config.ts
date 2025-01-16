import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  jsx: 'react',
  external: ['@eco/database', '@shopify/app-bridge', 'react', 'react-dom'],
  noExternal: ['@eco/shared'],
});
