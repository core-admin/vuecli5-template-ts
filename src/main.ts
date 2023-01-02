import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from '@/internal/pinia';
import { registerGlobalComponents } from '@/internal/components';
import { initProjectModules } from './init-modules';
import '@/styles/index.less';

const bootstrap = async () => {
  const app = createApp(App);
  app.use(pinia);
  app.use(router);
  registerGlobalComponents(app);
  initProjectModules();
  app.mount('#app');
};

bootstrap();

// 111








