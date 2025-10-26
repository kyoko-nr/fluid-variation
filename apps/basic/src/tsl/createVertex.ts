import { Fn, nodeObject, positionLocal, vec4 } from "three/tsl";

/**
 * vert.glsl の TSL 版。スクリーンクワッド用の頂点出力を生成する。
 */
export const createVertex = Fn(() => {
  const pos = nodeObject(positionLocal) || positionLocal;
  return vec4(pos, 1.0);
});
