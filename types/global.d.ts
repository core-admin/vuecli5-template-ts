import type { VNodeChild, PropType as VuePropType, Plugin } from 'vue';

declare global {
  type AnyFunction<T> = (...args: any[]) => T;

  type AnyObject<T = any> = {
    [key: string]: T;
  };

  type LabelValueOptions = {
    label: string;
    value: string | number;
    [key: string]: string | number | boolean;
  }[];

  type EmitType = (event: string, ...args: any[]) => void;

  interface ComponentElRef<T extends HTMLElement = HTMLDivElement> {
    $el: T;
  }

  type ComponentRef<T extends HTMLElement = HTMLDivElement> = ComponentElRef<T> | null;

  type ElRef<T extends HTMLElement = HTMLDivElement> = Nullable<T>;

  type CustomizedHTMLElement<T> = HTMLElement & T;

  type PartialReturnType<T extends (...args: unknown[]) => unknown> = Partial<ReturnType<T>>;

  type PropType<T> = VuePropType<T>;

  type VueNode = VNodeChild | JSX.Element;

  type Nullable<T> = T | null;

  type Recordable<T = any> = Record<string, T>;

  type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
  };

  type TimeoutHandle = ReturnType<typeof setTimeout>;

  type IntervalHandle = ReturnType<typeof setInterval>;

  type SFCWithInstall<T> = T & Plugin;

  interface ChangeEvent extends Event {
    target: HTMLInputElement;
  }

  // interface Window {
  //   $dialog: DialogApi;
  //   $message: MessageApi;
  // }
}
