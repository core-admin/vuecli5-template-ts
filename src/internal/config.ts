const { version } = require('../../package.json');

const VUE_APP_SHORT_NAME = process.env.VUE_APP_SHORT_NAME;

export function createStorageKeyPrefix() {
  return `${VUE_APP_SHORT_NAME}__${process.env.NODE_ENV}`.toUpperCase();
}

export function createStorageName() {
  return `${createStorageKeyPrefix()}__${version}__`.toUpperCase();
}

export function createLocalNameScope(name: string) {
  return `${VUE_APP_SHORT_NAME}__${name}__${process.env.NODE_ENV}__${version}__`.toUpperCase();
}
