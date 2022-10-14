import { isObject, isString } from '@/utils';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// 重载签名要么全部导出 要么全部都不导出
// 往axios的params参数里添加当前时间戳
export function joinTimestamp<T extends boolean>(
  join: boolean,
  restful: T,
): T extends true ? string : object;
export function joinTimestamp(join: boolean, restful = false): string | object {
  // 不添加时间戳
  if (!join) {
    return restful ? '' : {};
  }
  const now = new Date().getTime();
  if (restful) {
    return `?_t=${now}`;
  }
  return { _t: now };
}

// 将data中包含moment类型的对象处理成时间字符串，处理value的空格问题
export function formatRequestDate(params: Recordable) {
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return;
  }

  for (const key in params) {
    // 如果值是一个moment对象，通过moment格式化成标注时间字符串
    const format = params[key]?.format ?? null;
    if (format && typeof format === 'function') {
      params[key] = params[key].format(DATE_TIME_FORMAT);
    }
    if (isString(key)) {
      const value = params[key];
      if (value) {
        try {
          // 对字符串的值进行trim处理
          params[key] = isString(value) ? value.trim() : value;
        } catch (error: any) {
          throw new Error(error);
        }
      }
    }
    // 如果value是对象，进行二次处理（递归处理）
    if (isObject(params[key])) {
      formatRequestDate(params[key]);
    }
  }
}
