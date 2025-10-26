// @ts-nocheck

import {
  Fn,
  convertToTexture,
  float,
  nodeObject,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

interface DebugVisOptions {
  uvNode?: unknown;
  scale?: unknown;
  offset?: unknown;
}

/**
 * デバッグ表示用。速度ベクトルの大きさをグレースケールで表示する。
 */
export const debugVis = /*#__PURE__*/ Fn(
  ([textureNodeInput, options = {} as DebugVisOptions]) => {
    const textureNode = convertToTexture(textureNodeInput);
    const uvNode = nodeObject(options.uvNode) || textureNode.uvNode || uv();
    const scale = nodeObject(options.scale) || float(1.0);
    const offset = nodeObject(options.offset) || float(0.0);

    const data = textureNode.sample(uvNode);
    const magnitude = vec2(data.x, data.y).length();
    const intensity = magnitude.mul(scale).add(offset);

    return vec4(vec3(intensity, intensity, intensity), 1.0);
  },
);
