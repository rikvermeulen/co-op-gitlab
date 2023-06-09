import { defineConfig } from 'tsup';

const isDev = process.env.npm_lifecycle_event === 'dev';

export default defineConfig({
  clean: true,
  dts: true,
  tsconfig: 'tsconfig.json',
  entry: ['src/server.ts'],
  format: ['esm'],
  minify: !isDev,
  metafile: !isDev,
  sourcemap: true,
  target: 'esnext',
  outDir: 'dist',
  onSuccess: isDev ? 'node dist/server.js' : undefined,
});
