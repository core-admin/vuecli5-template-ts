const path = require('path');
const { defineConfig } = require('@vue/cli-service');
const { wrapperEnv, getAppEnvConfig, createProxy } = require('./build/env');
// const sourceMapPlugin = require('./build/plugins/source-map');

const env = getAppEnvConfig();
const vueEnv = wrapperEnv(env);
const { VUE_APP_PORT, VUE_APP_PROXY } = vueEnv;

const isProd = process.env.NODE_ENV === 'production';

function resolve(dir) {
  return path.join(__dirname, './', dir);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  filenameHashing: true,
  publicPath: isProd ? process.env.VUE_APP_PUBLIC_PATH : '/',
  // node_modules里面的文件不会经过babel再编译一遍
  // 是否需要在打包兼容一遍
  transpileDependencies: false,
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
  // https://github.com/vuejs/vue-cli/issues/3783
  css: {
    // https://github.com/vuejs/vue-cli/issues/5989
    // 是否分离css true:分离css，会造成css无法热更新，false：会把css打包进js中，js一更新css自然更新
    extract: isProd,
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
    // config.plugins.delete('prefetch');
    // config.plugins.delete('preload');

    // // 修复HMR (热更新不起作用可开启)
    // config.resolve.symlinks(true);

    handleSvgIcon(config);

    if (isProd) {
      // compressImage(config);
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
      plugins: [
        // sourceMapPlugin()
      ],
    };
    if (isProd) {
      // config.plugins.push(openGzip());

      config.optimization = {
        // https://webpack.docschina.org/configuration/optimization/#optimizationruntimechunk
        runtimeChunk: {
          name: 'manifest',
        },
        splitChunks: {
          minSize: 100 * 1000, // 大小超过30kb的模块才会被提取
          maxSize: 0, // 只是提示，可以被违反，会尽量将chunk分的比maxSize小，当设为0代表能分则分，分不了不会强制
          maxAsyncRequests: 5, // 分割后，按需加载的代码块最多允许的并行请求数，在webpack5里默认值变为6
          maxInitialRequests: 3, // 分割后，入口代码块最多允许的并行请求数，在webpack5里默认值变为4
          cacheGroups: {
            // 禁用默认缓存组
            default: false,
            dll: {
              name: 'dll-chunk',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: -1,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common-chunk',
              chunks: 'all',
              reuseExistingChunk: true,
              // enforce: true,
            },
            lib: {
              name: 'lib-chunk',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](axios|lodash-es|qs|dayjs|@ant-design\/colors)[\\/]/,
              priority: 3,
              reuseExistingChunk: true,
              // enforce: true,
            },
            'vue-lib': {
              name: 'vue-lib-chunk',
              test: /[\\/]node_modules[\\/](vue-router|pinia|@vueuse\/core|@vue\/shared)[\\/]/,
              chunks: 'all',
              priority: 3,
              reuseExistingChunk: true,
              enforce: true,
            },
            antv: {
              name: 'antv-chunk',
              test: /[\\/]node_modules[\\/](ant-design-vue|@ant-design-vue\/icons-vue)[\\/]/,
              chunks: 'all',
              priority: 3,
              reuseExistingChunk: true,
              enforce: true,
              // minSize: 300 * 1000,
            },
          },
        },
      };
    }
    return config;
  },
  pluginOptions: {},
});
