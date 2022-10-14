import { defaultRequest } from './index';
import { RequestUploadFileOptions, UploadApiResult } from '#/axios';

export function uploadApi(
  url: string,
  params: RequestUploadFileOptions,
  onUploadProgress?: (progressEvent: ProgressEvent) => void,
) {
  return defaultRequest.uploadFile<UploadApiResult>(
    {
      url,
      onUploadProgress,
    },
    params,
  );
}
