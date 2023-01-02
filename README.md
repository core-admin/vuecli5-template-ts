# 项目说明

基于 vuecli5（webpack5）+ vue3 + typescript + vue-router + pinia + eslint + prettier + commitlint 构建的一套项目模板。

## UI 框架

UI 框架需要注意的地方时，此模板使用了 `ant-design-vue`作为基础 UI 框架，如何更换先请自行更换，后续抽出时间会更换成公司统一用的 UI 框架。

辅助的 UI 框架，使用了 tailwindcss 框架，它以原子化的方式提供了我们开发时常用的样式，以类名的方式进行使用，css 的生产为增量生成，生成文件的大小取决于在项目与用到的类名种类的多少，具体使用方式请参照[文档](https://tailwindcss.com/)。

## 代码提交

代码提交遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 提交规范，规范的限制在 `.commitlintrc.js` 文件中。

代码提交时，会触发 `git` 的 `pre-commit` 钩子，此钩子的作用实在你提交代码时，会处理你缓存区的代码，具体会执行以下脚本：

```shell
npm run lint # 使用 vue-cli-service lint 校验与更正代码
npm run type:check # 使用 vue-tsc 检测项目代码中的的类型是否正确
pnpm exec lint-staged # lint-staged 触发对应的校验规则，配置文件为 lint-staged.config
```

以上脚本跑完，会校验你提交的信息是否符合 `Conventional Commits` 规范，提交信息不规范，将拒绝提交。

你可以使用一下命令：`echo "test: a" | npx commitlint` 来检测本次提交的 `commit message` 信息是否可以通过。

`"test: a"` 为提交的信息。

## svg-icon 组件

`src/components/SvgIcon` 组件可将 `src/assets/icons/svg-icons/*.svg` 文件作为 icon 图标使用，它与 `src/components/SvgFilIcon` 组件的区别是，前者会去除 svg 的默认颜色等属性，可自定义颜色，而后者主要是用来加载多色 svg 图标用的，后期加载的文件是 `src/assets/icons/svg-fill-icons/*.svg`。

当 UI 提供的图标是一个彩色图标时，可将 svg 文件文件放入`src/assets/icons/svg-fill-icons`目录下，使用`SvgFilIcon`组件进行加载。

## 补充

对于此模板的使用问题以及功能需求，请提交 issues，提交 issues 的好处是方便别人能根据已提交的 issues 定位问题是否已经提交或者解决，方便留痕与查阅。

## 后续内容待补充。。。
