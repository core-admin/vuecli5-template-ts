import type { ErrorMessageMode } from '#/axios';
import { useUserStoreWithOut } from '@/store/user';
import { useAppEnvSetting } from '@/hooks/setting/useEnv';
import { useMessage } from '@/hooks/web/useMessage';

export interface ContextOptions {
  errorFunction: AnyFunction<any>;
  errorModalFunction: AnyFunction<any>;
  getTokenFunction: () => unknown;
  errorLogFunction: (error: any) => void;
  unauthorizedFunction: (msg?: string) => void;
  timeoutFunction: () => void;
  handleErrorFunction: (message?: string, mode?: ErrorMessageMode) => void;
  apiUrl?: string;
  // uploadUrl?: string;
}

export let context: ContextOptions = {
  getTokenFunction: () => undefined,
  // http status 401 错误处理函数 校验的http状态码
  unauthorizedFunction: () => {},
  // message 形式的请求错误处理函数
  errorFunction: () => {},
  // 请求错误 弹窗的形式 modal
  errorModalFunction: () => {},
  // 调用时机为axios响应拦截器错误处理函数执行时
  errorLogFunction: () => {},
  // axios checkStatus 函数存在错误信息时执行的回调函数
  handleErrorFunction: () => {},
  // 请求 令牌失效 指定对应的操作函数 校验的自定义状态码
  timeoutFunction: () => {},
  // 基本请求地址
  apiUrl: '',
};

export const getDefaultContextOptions = (): ContextOptions => {
  const {
    apiUrl,
    // uploadUrl
  } = useAppEnvSetting();

  const { createMessage, createErrorModal } = useMessage();

  return {
    apiUrl,
    // uploadUrl,
    getTokenFunction() {
      const userStore = useUserStoreWithOut();
      return userStore.getToken;
    },
    errorFunction: createMessage.error,
    errorModalFunction: createErrorModal,
    errorLogFunction(_error) {
      // ...
    },
    timeoutFunction() {
      const userStore = useUserStoreWithOut();
      userStore.setToken(undefined);
      userStore.logout();
    },
    unauthorizedFunction() {
      const userStore = useUserStoreWithOut();
      userStore.setToken(undefined);
      userStore.logout();
    },
    handleErrorFunction(message, mode) {
      if (mode === 'modal') {
        createErrorModal({ title: '错误提示', content: message });
      } else if (mode === 'message') {
        createMessage.error(message as string);
      }
    },
  };
};
