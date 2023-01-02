export type ErrorMessageMode = 'none' | 'modal' | 'message' | undefined;

export interface RequestOptions {
  // 将请求参数拼接到url（注意：它会把params与data中的参数全部拼接到url上）
  joinParamsToUrl?: boolean;
  // 格式化请求参数时间
  formatDate?: boolean;
  // 是否处理请求结果
  isTransformResponse?: boolean;
  // 当状态码为200时，业务状态码非200时是否把接口的返回值直接作为错误信息进行抛出
  isThrowOriginError?: boolean;
  // 是否返回响应头信息：需要获取响应头时使用此属性
  isReturnNativeResponse?: boolean;
  // 接口地址，如果为空，则默认使用 apiUrl
  apiUrl?: string | (() => string);
  // 错误消息提示类型
  errorMessageMode?: ErrorMessageMode;
  // 是否添加时间戳，避免从缓存中拿数据（往params上添加时间戳）
  joinTime?: boolean;
  // 是否忽略重复的请求（重复的请求不进行处理，默认不处理）
  ignoreCancelToken?: boolean;
  // 是否在请求头中添加令牌
  withToken?: boolean;
}

export interface RequestResult<T = any> {
  code: number;
  msg: string;
  data: T;
}

// multipart/form-data: upload file
export interface RequestUploadFileOptions {
  // Other parameters
  data?: Record<string, any>;
  // File parameter interface field name
  name?: string;
  // file name
  file: File | Blob;
  // file name
  filename?: string;
  [key: string]: any;
}

export interface UploadApiResult {
  message: string;
  code: number;
  url: string;
}
