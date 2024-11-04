import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/marker-canvas-layer.ts',
  output: [
    {
      file: 'public/bundle.js',
      format: 'iife',
      name: 'MarkerCanvasModule',
      globals: {
        leaflet: 'L',
        rbush: 'RBush',
      },
    },
    {
      file: 'dist/index.js',
      format: 'esm',
      sourcemap: true,
    }
  ],
  external: ['leaflet', 'rbush'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
};
