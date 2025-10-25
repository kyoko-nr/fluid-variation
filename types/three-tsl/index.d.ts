declare module "three/tsl" {
  export type Node = any;
  export type TextureNode = any;
  export const Fn: <T = any>(callback: (args: any[]) => T) => ((...args: any[]) => T);
  export const uv: () => Node;
  export const vec2: (...args: any[]) => Node;
  export const vec3: (...args: any[]) => Node;
  export const vec4: (...args: any[]) => Node;
  export const float: (value?: number) => Node;
  export const int: (value?: number) => Node;
  export const nodeObject: (value: any) => Node;
  export const convertToTexture: (value: any) => TextureNode;
  export const clamp: (value: any, min: any, max: any) => Node;
  export const min: (...values: any[]) => Node;
  export const max: (...values: any[]) => Node;
  export const abs: (value: any) => Node;
  export const mix: (x: any, y: any, a: any) => Node;
  export const fract: (value: any) => Node;
  export const floor: (value: any) => Node;
  export const If: (
    condition: any,
    onTrue: () => void
  ) => {
    Else: (onFalse: () => void) => void;
  };
}
