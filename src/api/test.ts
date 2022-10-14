import { defaultRequest } from '@/utils/src/request/index';

export const testApi = () =>
  defaultRequest.get(
    { url: '/phones' },
    {
      errorMessageMode: 'modal',
    },
  );
