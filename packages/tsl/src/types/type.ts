import type { NodeMaterial } from "three/webgpu";

export type MaterialWithUniform<M extends NodeMaterial, U extends Record<string, object>> = M & {
  uniforms: U;
};
