import type { CreateAxiosOptions } from './axios-transform';
import type { AxiosRequestConfig, AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { RequestOptions, RequestResult, RequestUploadFileOptions } from '#/axios';

import axios from 'axios';
import qs from 'qs';
import { isFunction, cloneDeep } from '@/utils';
import { AxiosCanceler } from './axios-cancel';
import { ContentTypeEnum, RequestEnum } from '@/enums/http-enum';
export * from './axios-transform';

// 判断是否需要过滤重复请求
function isIgnoreCancel(config: CreateAxiosOptions, options: CreateAxiosOptions) {
  const ignoreCancelToken = config.headers?.ignoreCancelToken;
  return ignoreCancelToken !== undefined
    ? ignoreCancelToken
    : options.requestOptions?.ignoreCancelToken ?? true;
}

export class VAxios {
  // axios实例
  private axiosInstance: AxiosInstance;
  // axios.create()时需要的配置参数
  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.axiosInstance = axios.create(options);
    // 在实例化VAxios时就会对axios实例添加拦截器
    this.setupInterceptors();
  }

  // 创建axios实例
  private createAxios(config: CreateAxiosOptions): void {
    this.axiosInstance = axios.create(config);
  }

  // 获取传递过来的拦截器函数
  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  // 重新配置axios（暂无地方使用）
  configAxios(config: CreateAxiosOptions) {
    if (!this.axiosInstance) {
      return;
    }
    this.createAxios(config);
  }

  // 设置请求头
  setHeader(headers: any): void {
    if (!this.axiosInstance) {
      return;
    }
    Object.assign(this.axiosInstance.defaults.headers, headers);
  }

  // 添加各个拦截器
  private setupInterceptors() {
    // 实例化VAxios时会把对应的配置项传递过来，transform便是其中一个属性
    const transform = this.getTransform();
    if (!transform) {
      return;
    }

    const {
      // 请求拦截器
      requestInterceptors,
      // 请求拦截器错误时的回调
      requestInterceptorsCatch,
      // 响应拦截器
      responseInterceptors,
      // 响应拦截器的错误处理
      responseInterceptorsCatch,
    } = transform;

    // 实例化取消请求自定义类
    const axiosCanceler = new AxiosCanceler();

    // 配置请求拦截器
    this.axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
      // 如果ignoreCancelToken存在，则禁止取消重复请求（取消重复请求的功能将关闭）
      !isIgnoreCancel(config, this.options) && axiosCanceler.addPending(config);

      if (requestInterceptors && isFunction(requestInterceptors)) {
        config = requestInterceptors(config, this.options);
      }
      return config;
    }, undefined);

    // 捕获请求拦截器的错误
    requestInterceptorsCatch &&
      isFunction(requestInterceptorsCatch) &&
      this.axiosInstance.interceptors.request.use(undefined, requestInterceptorsCatch);

    // 处理响应拦截器
    this.axiosInstance.interceptors.response.use((res: AxiosResponse) => {
      !isIgnoreCancel(res.config, this.options) && axiosCanceler.removePending(res.config);
      if (responseInterceptors && isFunction(responseInterceptors)) {
        res = responseInterceptors(res);
      }
      return res;
    }, undefined);

    // 捕获响应拦截器的错误
    responseInterceptorsCatch &&
      isFunction(responseInterceptorsCatch) &&
      this.axiosInstance.interceptors.response.use(undefined, responseInterceptorsCatch);
  }

  // 文件上传 此方法仅适用于单个文件请求
  uploadFile<T = any>(config: AxiosRequestConfig, params: RequestUploadFileOptions) {
    const formData = new window.FormData();
    const customFilename = params.name || 'file';

    if (params.filename) {
      formData.append(customFilename, params.file, params.filename);
    } else {
      formData.append(customFilename, params.file);
    }

    // 如果还携带了额外参数 也会添加进formData里
    if (params.data) {
      Object.keys(params.data).forEach(key => {
        const value = params.data![key];
        if (Array.isArray(value)) {
          value.forEach(item => {
            formData.append(`${key}[]`, item);
          });
          return;
        }

        formData.append(key, params.data![key]);
      });
    }

    return this.axiosInstance.request<T>({
      ...config,
      method: 'POST',
      data: formData,
      headers: {
        'Content-type': ContentTypeEnum.FORM_DATA,
        // @ts-ignore
        ignoreCancelToken: true,
      },
    });
  }

  /**
   * 转序列化的操作：支持formData form-data qs application/x-www-form-urlencoded
   * 当 contentType === application/x-www-form-urlencoded时，且
   * 传递了data属性值，且
   * 请求方式不是get请求，此时会对data进行序列化操作
   */
  supportFormData(config: AxiosRequestConfig) {
    const headers = config.headers || this.options.headers;
    const contentType = headers?.['Content-Type'] || headers?.['content-type'];

    if (
      contentType !== ContentTypeEnum.FORM_URLENCODED ||
      !Reflect.has(config, 'data') ||
      config.method?.toUpperCase() === RequestEnum.GET
    ) {
      return config;
    }

    /**
     * qs示例
     * Qs.stringify(
     *  { a: ['b', 'c'] },
     *  {
     *    arrayFormat: 'brackets', // 指定数组转成的格式
     *    encode: false // 不进行编码 默认会进行编码
     *  }
     * )
     *
     * eval: a[]=b&a[]=c
     */
    return {
      ...config,
      data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
    };
  }

  get<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  post<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  put<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  delete<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }

  request<T = any>(config: AxiosRequestConfig, options?: RequestOptions): Promise<T> {
    // conf时定义请求时传递过来的一些配置参数 conf = config = AxiosRequestConfig
    let conf: CreateAxiosOptions = cloneDeep(config);
    const transform = this.getTransform();
    const { requestOptions } = this.options;

    // 合并实例化VAxios默认传递的options.requestOptions和调用接口时传递的RequestOptions配置项
    const opt: RequestOptions = Object.assign({}, requestOptions, options);

    const { beforeRequestHook, requestCatchHook, transformRequestHook } = transform || {};

    // 请求之前执行的一些操作（根据传递的配置处理传递过来的请求参数）
    if (beforeRequestHook && isFunction(beforeRequestHook)) {
      conf = beforeRequestHook(conf, opt);
    }
    conf.requestOptions = opt;

    // 对data转序列化操作（根据contentType进行相关的处理）
    conf = this.supportFormData(conf);

    return new Promise((resolve, reject) => {
      this.axiosInstance
        .request<any, AxiosResponse<RequestResult>>(conf)
        .then((res: AxiosResponse<RequestResult>) => {
          // transformRequestHook 处理请求过来的数据
          if (transformRequestHook && isFunction(transformRequestHook)) {
            try {
              const ret = transformRequestHook(res, opt, conf.contextOptions);
              resolve(ret);
            } catch (err) {
              reject(err || new Error('request error!'));
            }
            return;
          }
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error | AxiosError) => {
          if (requestCatchHook && isFunction(requestCatchHook)) {
            reject(requestCatchHook(e, opt));
            return;
          }
          if (axios.isAxiosError(e)) {
            // rewrite error message from axios in here
          }
          reject(e);
        });
    });
  }
}
