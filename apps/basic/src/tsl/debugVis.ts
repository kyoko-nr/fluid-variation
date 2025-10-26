import type Node from "three/src/nodes/core/Node.js";
import { convertToTexture, Fn, float, nodeObject, uv, vec2, vec3, vec4 } from "three/tsl";

/**
 * デバッグ表示用。速度ベクトルの大きさをグレースケールで表示する。
 */
export const debugVis = /*#__PURE__*/ Fn(
  ([textureNodeInput, uvNodeInput, scaleNode, offsetNode]: [Node, Node, Node, Node]) => {
    const textureNode = convertToTexture(textureNodeInput);
    const uvNode = nodeObject(uvNodeInput) || textureNode.uvNode || uv();
    const scale = nodeObject(scaleNode) || float(1.0);
    const offset = nodeObject(offsetNode) || float(0.0);

    const data = textureNode.sample(uvNode);
    const magnitude = vec2(data.x, data.y).length();
    const intensity = magnitude.mul(scale).add(offset);

    return vec4(vec3(intensity, intensity, intensity), 1.0);
  },
);
