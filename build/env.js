function wrapperEnv(envConf) {
  const ret = {};

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
  return ret;
}

function getAppEnvConfig() {
  const ENV = process.env;
  const {
    VUE_APP_SHORT_NAME,
    VUE_APP_PORT,
    NODE_ENV,
    NODE_MODE,
    VUE_APP_PROXY,
    VUE_APP_GLOB_API_URL,
    VUE_APP_GLOB_UPLOAD_URL,
  } = ENV;

  return {
    VUE_APP_SHORT_NAME,
    VUE_APP_PORT,
    NODE_ENV,
    NODE_MODE,
    VUE_APP_PROXY,
    VUE_APP_GLOB_API_URL,
    VUE_APP_GLOB_UPLOAD_URL,
  };
}

function createProxy(proxyList) {
  if (!proxyList) {
    return null;
  }

  if (typeof proxyList === 'string') {
    proxyList = JSON.parse(proxyList);
  }

  const ret = {};
  for (const [prefix, target] of proxyList) {
    ret[prefix] = {
      target,
      changeOrigin: true,
      ws: true,
      pathRewrite: path => path.replace(new RegExp(`^${prefix}`), ''),
    };
  }
  return ret;
}
module.exports = {
  wrapperEnv,
  getAppEnvConfig,
  createProxy,
};
