import type { NodeMaterial } from "three/webgpu";
import type { MaterialWithUniform } from "../types/type";

/**
 * 型推論できる形でNodeMaterialにuniformsを追加するユーティリティ関数
 */
export const assignUniforms = <M extends NodeMaterial, U extends Record<string, object>>(
  mat: M,
  uniforms: U,
): MaterialWithUniform<M, U> => {
  Object.assign(mat, { uniforms });
  return mat as M & { uniforms: U };
};
