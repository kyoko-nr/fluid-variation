import type Node from "three/src/nodes/core/Node.js";
import { convertToTexture, Fn, float, mix, nodeObject, uv, vec2, vec3, vec4 } from "three/tsl";

/**
 * render.glsl を TSL 化。速度の大きさに応じて色を補間する。
 */
export const renderVelocity = /*#__PURE__*/ Fn(
  ([textureNodeInput, uvNodeInput, colorStrengthNode, bgColorNode, fluidColorNode]: [
    Node,
    Node,
    Node,
    Node,
    Node,
  ]) => {
    const textureNode = convertToTexture(textureNodeInput);
    const uvNode = nodeObject(uvNodeInput) || textureNode.uvNode || uv();
    const colorStrength = nodeObject(colorStrengthNode) || float(1.0);
    const bgColor = nodeObject(bgColorNode) || vec3(0.0, 0.0, 0.0);
    const fluidColor = nodeObject(fluidColorNode) || vec3(1.0, 1.0, 1.0);

    const flippedUv = vec2(uvNode.x, float(1.0).sub(uvNode.y));
    const velocity = textureNode.sample(flippedUv).xy;
    const magnitude = velocity.length().mul(colorStrength);
    const color = mix(bgColor, fluidColor, magnitude);

    return vec4(color, 1.0);
  },
);
