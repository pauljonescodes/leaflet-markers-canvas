import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
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
  ],
  external: ['leaflet', 'rbush'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
    }),
  ],
};
