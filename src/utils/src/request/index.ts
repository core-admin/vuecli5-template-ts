import type { AxiosResponse } from 'axios';
import type { AxiosTransform, CreateAxiosOptions } from './axios-transform';
import type { RequestOptions, RequestResult } from '#/axios';

import { VAxios } from './Axios';
import { checkStatus } from './check-http-status';
import { isString, isFunction, cloneDeep, merge, setObjToUrlParams } from '@/utils';
import { RequestEnum, ResultEnum, ContentTypeEnum } from '@/enums/http-enum';
import { joinTimestamp, formatRequestDate } from './helper';
import { getDefaultContextOptions, ContextOptions } from './_brideg';

// 数据处理，方便区分多种处理方式
const transform: AxiosTransform = {
  // 处理请求过来的数据。如果数据不是预期格式，可直接抛出错误
  transformRequestHook: (
    res: AxiosResponse<RequestResult>,
    options: RequestOptions,
    context?: ContextOptions,
  ) => {
    const { isTransformResponse, isReturnNativeResponse, isThrowOriginError } = options;
    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res;
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取code，data，message这些信息时开启
    if (!isTransformResponse) {
      return res.data;
    }

    // 错误的时候返回
    const { data } = res;
    if (!data) {
      // return '[HTTP] Request has no return value';
      throw new Error('请求出错，请稍候重试');
    }
    //  这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { code, data: result, msg } = data;

    // 这里逻辑可以根据项目进行修改
    const hasSuccess = data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS;
    if (hasSuccess) {
      return result;
    }

    // 在此处根据自己项目的实际情况对不同的code执行不同的操作
    // 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
    let message = '请求出错，请稍候重试';
    switch (code) {
      // 身份验证无效或过期 执行对应的操作
      case ResultEnum.TIMEOUT:
        message = '登录超时,请重新登录!';
        context?.timeoutFunction?.();
        break;
      default:
        if (msg) {
          message = msg;
        }
    }

    // errorMessageMode='modal' 的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
    // errorMessageMode='none' 一般是调用时明确表示不希望自动弹出错误提示
    if (options.errorMessageMode === 'modal') {
      context?.errorModalFunction({
        title: '错误提示',
        content: message,
      });
    } else if (options.errorMessageMode === 'message') {
      context?.errorFunction(message);
    }

    if (isThrowOriginError) {
      message = data as any;
    }

    throw new Error(message);
  },

  // 请求之前处理（根据传递的options，处理请求数据的格式、拼接url、转换数据等）
  // 此函数仅处理数据，此处与axios配置无关
  beforeRequestHook: (config, options) => {
    const { apiUrl, joinParamsToUrl, formatDate, joinTime = true } = options;

    // 拼接基础url和接口的请求url
    if (apiUrl) {
      const _apuUrl = isString(apiUrl) ? apiUrl : isFunction(apiUrl) ? apiUrl?.() : '';
      config.url = `${_apuUrl}${config.url}`;
    }

    const params = config.params || {};
    const data = config.data || false;
    // 将data中可能存在的moment对象转成字符串，对所有字符串执行trim操作
    formatDate && data && !isString(data) && formatRequestDate(data);
    // 处理get类型的请求
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {}, joinTimestamp(joinTime, false));
      } else {
        // 兼容restful风格 例：/account/1 >>> /account/1?_t=1636511234276
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else {
      // 非get请求
      if (!isString(params)) {
        formatDate && formatRequestDate(params);

        /* fix: 此处为存在post请求使用params传参，如果data不存在直接将params挂到data上不太合适，严格限制死了非get请求不能使用params传参

          // 如果data存在
          if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
            config.data = data;
            config.params = params;
          } else {
            // 非GET请求如果没有提供data，则将params视为data
            config.data = params;
            config.params = undefined;
          }

        */

        // fix: 对以上代码打补丁
        if (Reflect.has(config, 'data') && config.data && Object.keys(config.data).length > 0) {
          config.data = data;
        }
        config.params = params;

        // 将传递的请求参数全部拼接到url上
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(
            config.url as string,
            Object.assign({}, config.params, config.data),
          );
        }
      } else {
        /** 兼容restful风格 举例：
         *  define API: { url: '/getlist' }
         *  send request: { params: '/48546/id/45445' }
         *  实际请求的地址：url: '/getlist/48546/id/45445'
         */
        config.url = config.url + params;
        config.params = undefined;
      }
    }
    return config;
  },

  // 请求拦截器处理（设置token）
  requestInterceptors: (config, options) => {
    const context = options.contextOptions;
    // 请求之前处理config
    const token = context?.getTokenFunction?.();
    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      // jwt token
      (config as Recordable).headers.Authorization = options.authenticationScheme
        ? `${options.authenticationScheme} ${token}`
        : token;
    }
    return config;
  },

  // 响应拦截器处理
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res;
  },

  // 响应拦截器错误处理
  // error: AxiosError
  responseInterceptorsCatch: error => {
    // 此处的属性是axios包装过的error对象
    // response 就是如果接口成功了的返回信息 response: AxiosResponse
    // code是axios里的错误代码，如："ECONNABORTED"
    const { response, code, message, config } = error || {};
    const context = config.contextOptions;
    context?.errorLogFunction?.(error);

    const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none';

    // const msg: string = response?.data?.error?.message ?? '';
    // 后台接口返回的错误信息
    const msg: string = response?.data?.msg ?? '';
    // 浏览器级别的错误信息
    const err: string = error?.toString?.() ?? '';
    let errMessage = '';

    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        errMessage = '接口请求超时，请刷新页面重试！';
      }
      if (err?.includes('Network Error')) {
        errMessage = '网络异常，请检查您的网络连接是否正常！';
      }

      if (errMessage) {
        if (errorMessageMode === 'modal') {
          context?.errorModalFunction({ title: '错误提示', content: errMessage });
        } else if (errorMessageMode === 'message') {
          context?.errorFunction(errMessage);
        }
        return Promise.reject(error);
      }
    } catch (error) {
      throw new Error(error as unknown as string);
    }
    checkStatus({
      status: error.response!.status,
      msg,
      errorMessageMode,
      context,
    });
    return Promise.reject(error);
  },
};

export const defaultInitAxiosOptions: CreateAxiosOptions = (() => {
  const context = getDefaultContextOptions();
  return {
    authenticationScheme: 'bearer',
    timeout: 15 * 1000,
    headers: { 'Content-Type': ContentTypeEnum.JSON },
    // 如果是form-data格式
    // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
    // 数据处理方式
    transform,
    // 配置项，下面的选项都可以在独立的接口请求中覆盖
    requestOptions: {
      // 是否返回原生响应头 比如：需要获取响应头时使用该属性
      isReturnNativeResponse: false,
      // 需要对返回数据进行处理
      isTransformResponse: true,
      isThrowOriginError: false,
      // post请求的时候添加参数到url（注意：它会把params与data中的参数全部拼接到url上）
      joinParamsToUrl: false,
      // 格式化提交参数时间
      formatDate: true,
      // 消息提示类型
      errorMessageMode: 'message',
      // 接口地址
      apiUrl: () => context.apiUrl || '',
      //  是否加入时间戳
      joinTime: true,
      // 忽略重复请求
      ignoreCancelToken: true,
      // 是否携带token
      withToken: true,
    },
    contextOptions: context,
  };
})();

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(merge(cloneDeep(defaultInitAxiosOptions), opt || {}));
}

export const defaultRequest = createAxios();
