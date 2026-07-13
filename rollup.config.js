import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import polyfillNode from 'rollup-plugin-polyfill-node';
import terser from '@rollup/plugin-terser';

const typescriptOptions = {
  include: ['*.ts', '**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
};

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index.js',
        format: 'cjs',
        inlineDynamicImports: true,
        sourcemap: false,
      },
      {
        file: 'lib/index.es.js',
        format: 'esm',
        inlineDynamicImports: true,
        sourcemap: false,
      },
      {
        file: 'lib/index.umd.js',
        format: 'umd',
        name: 'openImSdkWasm',
        inlineDynamicImports: true,
        sourcemap: false,
      },
    ],
    plugins: [alias(), typescript(typescriptOptions), resolve(), commonjs()],
  },
  {
    input: 'src/api/worker.ts',
    output: [
      {
        file: 'lib/worker.js',
        format: 'esm',
        sourcemap: false,
      },
      {
        file: 'lib/worker-legacy.js',
        format: 'iife',
        sourcemap: false,
      },
    ],
    plugins: [
      alias(),
      typescript({
        ...typescriptOptions,
        tsconfig: './tsconfig.build.json',
      }),
      resolve(),
      commonjs(),
      polyfillNode(),
      terser(),
    ],
  },
];
