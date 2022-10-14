interface EnvGlobConfig {
  VUE_APP_SHORT_NAME: string;
  VUE_APP_PORT: number;
  NODE_ENV: 'development' | 'production';
  VUE_APP_NODE_MODE: 'dev' | 'pro' | 'test';
  VUE_APP_PROXY?: string;
  VUE_APP_GLOB_API_URL: string;
  VUE_APP_GLOB_UPLOAD_URL?: string;
}

function wrapperEnv(envConf: AnyObject): EnvGlobConfig {
  const ret = {} as AnyObject;

  for (const envName of Object.keys(envConf)) {
    let realName = (envConf[envName] || '').replace(/\\n/g, '\n');
    realName = realName === 'true' ? true : realName === 'false' ? false : realName;

    if (envName === 'VUE_APP_PORT') {
      realName = Number(realName);
    }
    if (envName === 'VUE_APP_PROXY' && realName) {
      try {
        realName = JSON.parse(realName.replace(/'/g, '"'));
      } catch (error) {
        realName = '';
      }
    }
    ret[envName] = realName;
  }
  return ret as EnvGlobConfig;
}

function getAppEnvConfig() {
  const ENV = process.env;
  const {
    VUE_APP_SHORT_NAME,
    VUE_APP_PORT,
    NODE_ENV,
    VUE_APP_NODE_MODE,
    VUE_APP_PROXY,
    VUE_APP_GLOB_API_URL,
    VUE_APP_GLOB_UPLOAD_URL,
  } = ENV;

  return {
    VUE_APP_SHORT_NAME,
    VUE_APP_PORT,
    NODE_ENV,
    VUE_APP_NODE_MODE,
    VUE_APP_PROXY,
    VUE_APP_GLOB_API_URL,
    VUE_APP_GLOB_UPLOAD_URL,
  };
}

module.exports = {
  wrapperEnv,
  getAppEnvConfig,
};
