// import { useAppStoreWithOut } from '@/store/app';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const initThemeColor = async () => {
//   const { getThemeColor, updateThemeColor } = useAppStoreWithOut();
//   await updateThemeColor(getThemeColor);
// };

// 可初始化一些模块
export const initProjectModules = async () => {
  const modules = [];

  if (!modules.length) {
    return;
  }

  await Promise.all([]);
};
