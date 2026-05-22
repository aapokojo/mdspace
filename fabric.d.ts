// Type declaration for fabric.js v4
declare module 'fabric' {
  export const fabric: {
    Canvas: new (container: HTMLElement | string, options?: any) => any;
    Rect: new (options?: any) => any;
    Textbox: new (text: string, options?: any) => any;
    Text: new (text: string, options?: any) => any;
    Group: new (...objects: any[]) => any;
    [key: string]: any;
  };
}

// Extend window interface for global fabric access
declare global {
  interface Window {
    fabric: {
      Canvas: new (container: HTMLElement | string, options?: any) => any;
      Rect: new (options?: any) => any;
      Textbox: new (text: string, options?: any) => any;
      Text: new (text: string, options?: any) => any;
      [key: string]: any;
    };
  }
}
