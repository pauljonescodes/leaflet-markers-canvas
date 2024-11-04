import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/leaflet-markers-canvas.ts',
  output: {
    file: 'public/dist/bundle.js',
    format: 'iife', // Immediately Invoked Function Expression, suitable for <script> tags
    name: 'MarkersCanvasModule', // Global variable name for your module
    globals: {
      leaflet: 'L',
      rbush: 'RBush'
    }
  },
  external: ['leaflet', 'rbush'], // Exclude these from the bundle
  plugins: [
    typescript({
      tsconfig: './tsconfig.json'
    })
  ]
};
