// 取消重复拦截可参考：https://juejin.cn/post/6968630178163458084

import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { RequestOptions, RequestResult } from '#/axios';
import { ContextOptions } from './_brideg';

export interface CreateAxiosOptions extends AxiosRequestConfig {
  /**
   * 作用是在 token的值前拼接一段字符串
   * 例如携带token的方式使用的是：Authorization中的Basic Auth
   * headers: {
   *   Authorization: 'Basic xxxxxxxx='
   * }
   */
  authenticationScheme?: string;
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;

  contextOptions?: ContextOptions;
}

export abstract class AxiosTransform {
  // 发起请求前的配置
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;

  // 请求成功后的处理
  transformRequestHook?: (
    res: AxiosResponse<RequestResult>,
    options: RequestOptions,
    contenxtOptions?: ContextOptions,
  ) => any;

  // 请求失败处理
  requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>;

  // 请求拦截器
  requestInterceptors?: (
    config: AxiosRequestConfig,
    options: CreateAxiosOptions,
  ) => AxiosRequestConfig;

  // 响应拦截器
  responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>;

  // 请求拦截器的错误处理
  requestInterceptorsCatch?: (error: Error) => void;

  // 响应拦截器的错误处理
  responseInterceptorsCatch?: (
    error: Error & {
      config: CreateAxiosOptions;
      isAxiosError: boolean;
      response?: AxiosResponse<RequestResult>;
      request?: any;
      code?: string;
    },
  ) => void;
}
