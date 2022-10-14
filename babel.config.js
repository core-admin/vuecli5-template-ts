const plugins = [
  '@vue/babel-plugin-jsx',
  // 支持 ?. 可选链
  '@babel/plugin-proposal-optional-chaining',
  // 支持 ??
  '@babel/plugin-proposal-nullish-coalescing-operator',
  ['import', { libraryName: 'ant-design-vue', libraryDirectory: 'es', style: true }],
];

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  // `style: true` 会加载 less 文件
  plugins,
};
