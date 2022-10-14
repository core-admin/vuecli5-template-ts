import type { AxiosRequestConfig, Canceler } from 'axios';
import axios from 'axios';
import { isFunction } from '@/utils';

/**
 * 过滤重复请求：
 * 1.在请求拦截器中
 */

// 用于存储每个请求的标识和取消功能
let pendingMap = new Map<string, Canceler>();

// 存储的标识符以&与请求方式和请求路径进行拼接
export const getPendingUrl = (config: AxiosRequestConfig) => [config.method, config.url].join('&');

export class AxiosCanceler {
  /**
   * Add request 挂起请求
   * @param {Object} config
   */
  addPending(config: AxiosRequestConfig) {
    this.removePending(config);
    const url = getPendingUrl(config);
    config.cancelToken =
      config.cancelToken ||
      new axios.CancelToken(cancel => {
        if (!pendingMap.has(url)) {
          // 如果挂起的请求中没有当前请求则添加
          pendingMap.set(url, cancel);
        }
      });
  }

  /**
   * @description: 清除所有挂起的请求，调用存储的所有cancel方法，然后清空
   */
  removeAllPending() {
    pendingMap.forEach(cancel => {
      cancel && isFunction(cancel) && cancel();
    });
    pendingMap.clear();
  }

  /**
   * Removal request 删除挂起的请求
   * @param {Object} config
   */
  removePending(config: AxiosRequestConfig) {
    const url = getPendingUrl(config);

    if (pendingMap.has(url)) {
      // 如果挂起中存在当前请求标识符，需要取消并删除当前请求
      const cancel = pendingMap.get(url);
      cancel && cancel(url);
      pendingMap.delete(url);
    }
  }

  /**
   * @description: reset
   */
  reset(): void {
    pendingMap = new Map<string, Canceler>();
  }
}
