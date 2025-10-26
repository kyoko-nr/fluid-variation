// @ts-nocheck

import {
  Fn,
  convertToTexture,
  float,
  max,
  min,
  nodeObject,
  uv,
  vec2,
  vec4,
} from "three/tsl";
import { applyReflectiveBoundary } from "@fluid/tsl";

interface AddForceOptions {
  texelSize: unknown;
  forceCenter?: unknown;
  forceDeltaV?: unknown;
  forceRadius?: unknown;
  elasticity?: unknown;
  uvNode?: unknown;
}

const EPSILON = 1e-6;

/**
 * addForce.glsl を TSL に移植したフラグメントロジック。
 */
export const addForce = /*#__PURE__*/ Fn(
  ([textureNodeInput, options = {} as AddForceOptions]) => {
    const textureNode = convertToTexture(textureNodeInput);
    const texelSize = nodeObject(options.texelSize) || vec2(1.0, 1.0);
    const forceCenter = nodeObject(options.forceCenter) || vec2(0.5, 0.5);
    const forceDeltaV = nodeObject(options.forceDeltaV) || vec2(0.0, 0.0);
    const forceRadius = nodeObject(options.forceRadius) || float(1.0);
    const elasticity = nodeObject(options.elasticity) || float(1.0);
    const uvNode = nodeObject(options.uvNode) || textureNode.uvNode || uv();

    const data = textureNode.sample(uvNode);
    const radius = vec2(forceRadius).mul(texelSize);
    const safeRadius = max(radius, vec2(EPSILON, EPSILON));
    const nd = uvNode.sub(forceCenter).div(safeRadius);
    const len = nd.length();
    const falloff = float(1.0)
      .sub(min(len, float(1.0)))
      .toVar();
    falloff.assign(falloff.mul(falloff));

    const injected = data.xy.add(forceDeltaV.mul(falloff));
    const reflected = applyReflectiveBoundary(
      uvNode,
      texelSize,
      injected,
      elasticity,
    );

    return vec4(reflected.x, reflected.y, data.z, data.w);
  },
);
