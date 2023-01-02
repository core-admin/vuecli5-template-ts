module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 108],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新特性、新功能
        'fix', // 修改bug
        'perf', // 优化相关，比如提升性能、体验
        'style', // 代码风格相关
        'docs', // 文档修改
        'test', // 测试用例修改
        'refactor', // 代码重构
        'build', // 编译相关的修改，例如发布版本、对项目构建或者依赖的改动
        'ci', // 持续集成修改
        'chore', // 其他修改, 比如改变构建流程、或者增加依赖库、工具等（杂项的改动）
        'revert', // 回滚到上一个版本、撤销修改
        'workflow', // 工作流修改
        'types', // 类型定义改动
      ],
    ],
  },
};
