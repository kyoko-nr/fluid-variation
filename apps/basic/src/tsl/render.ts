// @ts-nocheck

import {
  Fn,
  convertToTexture,
  float,
  mix,
  nodeObject,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

interface RenderOptions {
  uvNode?: unknown;
  colorStrength?: unknown;
  bgColor?: unknown;
  fluidColor?: unknown;
}

/**
 * render.glsl を TSL 化。速度の大きさに応じて色を補間する。
 */
export const renderVelocity = /*#__PURE__*/ Fn(
  ([textureNodeInput, options = {} as RenderOptions]) => {
    const textureNode = convertToTexture(textureNodeInput);
    const uvNode = nodeObject(options.uvNode) || textureNode.uvNode || uv();
    const colorStrength = nodeObject(options.colorStrength) || float(1.0);
    const bgColor = nodeObject(options.bgColor) || vec3(0.0, 0.0, 0.0);
    const fluidColor = nodeObject(options.fluidColor) || vec3(1.0, 1.0, 1.0);

    const flippedUv = vec2(uvNode.x, float(1.0).sub(uvNode.y));
    const velocity = textureNode.sample(flippedUv).xy;
    const magnitude = velocity.length().mul(colorStrength);
    const color = mix(bgColor, fluidColor, magnitude);

    return vec4(color, 1.0);
  },
);
