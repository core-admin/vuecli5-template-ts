# 依赖安装

# 代码提交规范

## commitizen

<!-- https://www.cnblogs.com/Yellow-ice/p/15353900.html -->

`commitizen`是一个 cli 工具，用于规范 git commit 信息，可以代替 git commit

## Conventional Commits 规范定义的 Type 类型

| Type     | Description                                              |
| -------- | -------------------------------------------------------- |
| feat     | 新增 feature                                             |
| fix      | 修复 bug                                                 |
| docs     | 仅仅修改了文档，比如：README、CHANGELOG、CONTRIBUTE 等等 |
| style    | 仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑       |
| refactor | 代码重构，没有加新功能或者修复 bug                       |
| perf     | 优化代码方面，比如提升性能、体验                         |
| test     | 测试用例，包括单元测试、集成测试等                       |
| chore    | 改变构建流程、或者增加依赖库、工具等                     |

安装 commitizen

`pnpm i commitizen -D`

安装 conventional-changelog-cli 生成提交日志 从 git metadata 生成变更日志

`npx i conventional-changelog-cli -D`

## 安装 lint-staged

Lint-staged 可以在 git staged 阶段的文件上执行 Linters，简单说就是当我们运行 ESlint 或 Stylelint 命令时，可以通过设置指定只检查我们通过 git add 添加到暂存区的文件，可以避免我们每次检查都把整个项目的代码都检查一遍，从而提高效率。

其次，Lint-staged 允许指定不同类型后缀文件执行不同指令的操作，并且可以按步骤再额外执行一些其它 shell 指令。

安装依赖

`pnpm i @commitlint/cli @commitlint/config-conventional -D`

**新版 husky 的工作原理**

新版的 husky 使用了从 git 2.9 开始引入的一个新功能 core.hooksPath。core.hooksPath 可以让你指定 git hooks 所在的目录而不是使用默认的.git/hooks/。这样 husky 可以使用 husky install 将 git hooks 的目录指定为.husky/，然后使用 husky add 命令向.husky/中添加 hook。通过这种方式我们就可以只添加我们需要的 git hook，而且所有的脚本都保存在了一个地方（.husky/目录下）因此也就不存在同步文件的问题了。

1. 安装 husky

`pnpm i husky -D`

2. 在 packgae.json 中添加 prepare 脚本

```javascript
{
  "scripts": {
    "prepare": "husky install"
  }
}

```

prepare 脚本会在 pnpm install（不带参数）之后自动执行。也就是说当我们执行 pnpm install 安装完项目依赖后会执行 husky install 命令，该命令会创建.husky/目录并指定该目录为 git hooks 所在的目录。

此命令如果不执行，git commit 钩子将不存在也就不会触发 commit 校验

## only-allow

only-allow 来规范团队的包管理工具

以我当前所在的项目组为例，有四个前端开发工程师。每个人在安装依赖的时候方式不一，我习惯用 cnpm install，别人习惯用 yarn install 或 npm install。这样的场景下，可能存在每个人所处的开发环境的依赖包不同。因此，可以试图用工具去规范团队： only-allow 。

只需在 package.json 中加入一行代码来限制，如下含义：只允许使用 npm 来进行安装

npx only-allow [method]（method 可取值：npm | yarn | pnpm）

```javascript
{
  "scripts": {
    // ... 其他命令
    "preinstall": "npx only-allow pnpm" // 使用pnpm作为包管理工具
 }
}
```

preinstall 是包安装工具的 钩子函数，在上例中作为 install 之前的拦截判断

其他钩子如下：

```shell
# install 之前触发
preinstall

install

# install 之后触发
postinstall
```

当配置了当前项目只能通过 pnpm 来安装依赖时，如使用`yarn install`来进行安装，终端会报错。并终止安装进程，应使用`pnpm install`来安装本项目的依赖

至此，便达到规范一个项目内使用相同包管理工具的目标

<!-- "postinstall": "node ./scripts/prepare.js" -->

# 项目优化

## vuecli 的预加载

### 删除预加载

vuecli 的预加载功能是默认开启的。

```javascript
module.exports = {
  chainWebpack(config) {
    // 移除 prefetch 插件
    // prefetch 加载其他页面资源，空闲时加载，不一定会加载
    config.plugins.delete('prefetch');
    // 删除文件预加载
    // preload 加载当前页面的资源，一定会加载，在渲染前加载
    config.plugins.delete('preload');
  },
};
```

### prefetch，preload 使用的必要性

prefetch 预加载是不会影响当前页面的加载性能的，因此预加载是可以被保留的，什么情况下我们需要禁用预加载呢？对流量损耗敏感（移动端）的应用场景，在首页对子页面进行全面的预加载，而用户可能只需要跳转其中的一两个子页面甚至停留在首页，造成大量的流量浪费。需要做到控制特定的路由预加载。首先，先移除 prefetch 插件，然后按需添加预加载。

```javascript
import(/* webpackPrefetch: true */ './componentA.vue');
```

preload 用于提高资源加载的优先级，当页面开始加载时，我们总是想核心的代码或资源得到优先处理，因此可以通过 preloading 提高优先级。

```javascript
import(/* webpackPreload: true */ 'lbrary');
```

错误的使用 webpackPreload 实际上会影响性能，因此要谨慎使用。

如果把一个体积巨大的资源放在最高优先级加载，页面可能会长时间空白，用户体验体验非常差，因此，慎用。

优化点：懒加载优化了首屏加载的速率，prefetch 预加载优化了子页面加载的速率

### 打包预览文件大小

安装插件 `pnpm i webpack-bundle-analyzer -D`

### moment 优化

如果项目中用到了 moment 这个库，打包出来的文件会比较大，可通过以下方式进行优化，排除比重比较大的 moment 库中的多语言文件。

```javascript
const webpack = require('webpack');

module.exports = {
  chainWebpack: config => {
    config
      .plugin('ignore')
      .use(new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn$/));

    return config;
  },
};
```

### babel

1. 使用 `babel-plugin-import` 插件，支持 ant-design-vue 按需引入；

2. 使用 `@vue/babel-plugin-jsx` 插件，让 vue 支持 jsx；

3. 使用 `@babel/plugin-proposal-optional-chaining` 插件，让浏览器支持实验阶段的 es 可选链 新语法

4. 使用 `@babel/plugin-proposal-nullish-coalescing-operator` 插件，让浏览器支持实验阶段的 es 零合并操作符

### script 命令

```json5
{
  scripts: {
    // 初始化项目 安装依赖
    bootstrap: 'pnpm install',
    // 启动项目
    dev: 'pnpm run serve',
    serve: 'vue-cli-service serve',
    // 测试环境打包
    'build:test': 'vue-cli-service build --mode=test',
    // 预发环境打包
    'build:preview': 'vue-cli-service build --mode=test preview',
    // 生产环境打包
    'build:production': 'vue-cli-service build',
    // 打包查看项目各个包资源的分布于大小
    'build:test:report': 'vue-cli-service build --mode=test --report',
    // 格式化项目代码
    lint: 'vue-cli-service lint',
    log: 'conventional-changelog -p angular -i CHANGELOG.md -s',
    'lint:eslint': 'eslint --cache --max-warnings 0  "{src,mock}/**/*.{vue,ts,tsx}" --fix',
    'lint:prettier': 'prettier --write  "src/**/*.{js,json,tsx,css,less,scss,vue,html,md}"',
    'lint:lint-staged': 'lint-staged',
    // 限制项目的依赖安装通过 pnpm 来下载和管理
    preinstall: 'npx only-allow pnpm',
    // 安装 husky 工具
    prepare: 'husky install',
  },
}
```

1
