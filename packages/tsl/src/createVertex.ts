import { Fn, vec4, positionWorld } from "three/tsl";

/**
 * vert.glsl の TSL 版。スクリーンクワッド用の頂点出力を生成する。
 */
export const createVertex = Fn(() => {
  return vec4(positionWorld, 1.0);
});
