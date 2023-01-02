// @ts-ignore
// eslint-disable-next-line
// import type { PiniaPluginContext } from 'pinia';

export declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptions<Id, S, G, A> {
    /**
     * Persist store in storage.
     */
    persist?: PersistOptions;
  }
}

export interface PersistStrategy {
  key?: string;
  storage?: Storage;
  paths?: string[];
}

export interface PersistOptions {
  strategies?: PersistStrategy[];
}
