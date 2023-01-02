const { getAppEnvConfig } = require('/build/env.js');

interface EnvGlobConfig {
  VUE_APP_SHORT_NAME: string;
  VUE_APP_PORT: number;
  NODE_ENV: 'development' | 'production';
  VUE_APP_NODE_MODE: 'development' | 'test' | 'preview' | 'production';
  VUE_APP_PROXY?: string;
  VUE_APP_GLOB_API_URL: string;
  VUE_APP_GLOB_UPLOAD_URL?: string;
}

export const useAppEnvSetting = () => {
  const { VUE_APP_GLOB_API_URL, VUE_APP_GLOB_UPLOAD_URL } = getAppEnvConfig() as EnvGlobConfig;

  return {
    apiUrl: VUE_APP_GLOB_API_URL,
    uploadUrl: VUE_APP_GLOB_UPLOAD_URL,
  };
};
