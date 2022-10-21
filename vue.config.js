const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const { wrapperEnv, getAppEnvConfig, createProxy } = require('./build/env');

const env = getAppEnvConfig();
const vueEnv = wrapperEnv(env);
const { VUE_APP_PORT, VUE_APP_PROXY } = vueEnv;

const isProd = process.env.NODE_ENV === 'production';

function resolve(dir) {
  return path.join(__dirname, './', dir);
}

const isReport = process.argv.includes('--report');

// 预览打包后的文件大小与分布
function previewBuild() {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
  return new BundleAnalyzerPlugin();
}

function openGzip() {
  const CompressionWebpackPlugin = require('compression-webpack-plugin');
  return new CompressionWebpackPlugin({
    // 此处为新版写法
    filename: '[path][base].gz',
    threshold: 10240,
    minRatio: 0.8,
    test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
    deleteOriginalAssets: false,
  });
}

function compressImage(config) {
  config.module
    .rule('images')
    .use('image-webpack-loader')
    .loader('image-webpack-loader')
    .options({
      mozjpeg: { progressive: true, quality: 65 },
      optipng: { enabled: false },
      pngquant: { quality: [0.65, 0.9], speed: 4 },
      gifsicle: { interlaced: false },
      // webp: { quality: 75 }
    });
}

const handleSvgIcon = config => {
  config.module.rule('svg').exclude.add(resolve('src/assets/svg-icons')).end();

  config.module
    .rule('icons')
    .test(/\.svg$/)
    .include.add(resolve('src/assets/svg-icons'))
    .end()
    .use('svg-sprite-loader')
    .loader('svg-sprite-loader')
    .options({
      symbolId: 'custom-icon-[name]',
    })
    .end()
    .before('svg-sprite-loader')
    .use('svgo-loader')
    .loader('svgo-loader')
    // 对 svg sprite的一些设置 -> svgo
    .options({
      plugins: [
        {
          name: 'preset-default',
          params: {
            // 覆写默认插件配置
            overrides: {},
          },
        },
        {
          name: 'removeAttrs',
          params: {
            attrs: '(fill|fill-rule|clip-rule)',
          },
        },
        {
          name: 'addAttributesToSVGElement',
          params: {
            attributes: [{ fill: 'currentColor' }],
          },
        },
      ],
    });
};

module.exports = defineConfig({
  publicPath: isProd ? process.env.VUE_APP_PUBLIC_PATH : '/',
  // node_modules里面的文件不会经过babel再编译一遍
  // 是否需要在打包兼容一遍
  transpileDependencies: true,
  // transpileDependencies: [],
  productionSourceMap: false,
  // 是否使用包含运行时编译器的 Vue 构建版本
  runtimeCompiler: false,
  devServer: {
    port: VUE_APP_PORT,
    open: false,
    hot: false,
    proxy: createProxy(VUE_APP_PROXY),
  },
  css: {
    // 是否分离css true:分离css，会造成css无法热更新，false：会把css打包进js中，js一更新css自然更新
    extract: process.env.NODE_ENV !== 'development',
    sourceMap: false,
    loaderOptions: {
      less: {
        lessOptions: {
          javascriptEnabled: true,
        },
      },
    },
  },
  chainWebpack(config) {
    // 移除预加载与优先加载功能
    config.plugins.delete('prefetch');
    config.plugins.delete('preload');

    // 修复HMR (热更新不起作用可开启)
    config.resolve.symlinks(true);

    handleSvgIcon(config);

    if (isProd) {
      compressImage(config);
      config.optimization.minimize(true);
    } else {
      config.devtool('source-map');
    }
  },
  configureWebpack() {
    const config = {
      resolve: {
        fallback: {
          crypto: false,
          fs: false,
          path: false,
        },
        alias: {
          '@': resolve('./src'),
          '#': resolve('./types'),
        },
      },
      plugins: [],
    };
    if (isProd) {
      config.plugins.push(openGzip());

      if (isReport) {
        config.plugins.push(previewBuild());
      }

      config.optimization = {
        // https://webpack.docschina.org/configuration/optimization/#optimizationruntimechunk
        runtimeChunk: {
          name: 'manifest',
        },
        splitChunks: {
          cacheGroups: {
            libs: {
              name: 'chunk-vendor',
              chunks: 'initial',
              minChunks: 1,
              test: /[\\/]node_modules[\\/]/,
              priority: 1,
              reuseExistingChunk: true,
              enforce: true,
            },
            common: {
              name: 'chunk-common',
              chunks: 'initial',
              minChunks: 2,
              maxInitialRequests: 5,
              minSize: 0,
              priority: 2,
              reuseExistingChunk: true,
              enforce: true,
            },
            lib: {
              name: 'chunk-lib',
              chunks: 'all',
              minChunks: 1,
              test: /[\\/]node_modules[\\/](axios|lodash-es|qs|dayjs|@ant-design\/colors)[\\/]/,
              priority: 3,
              reuseExistingChunk: true,
              enforce: true,
            },
            awesomeVue: {
              name: 'awesome-vue',
              test: /[\\/]node_modules[\\/](vue|vue-router|pinia|@vueuse\/core|@vue\/shared)[\\/]/,
              chunks: 'all',
              priority: 3,
              reuseExistingChunk: true,
              enforce: true,
            },
            // awesomeVueComponent: {
            //   name: 'awesome-vue-component',
            //   test: /[\\/]node_modules[\\/](qrcodejs2-fix|v-contextmenu|vue-cropper)[\\/]/,
            //   chunks: 'all',
            //   priority: 3,
            //   reuseExistingChunk: true,
            //   enforce: true,
            // },
            antv: {
              name: 'chunk-antv',
              test: /[\\/]node_modules[\\/]ant-design-vue[\\/]/,
              chunks: 'all',
              priority: 3,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
  pluginOptions: {},
});
