import { applyReflectiveBoundary } from "@fluid/tsl";
import type Node from "three/src/nodes/core/Node.js";
import { convertToTexture, Fn, float, max, min, nodeObject, uv, vec2, vec4 } from "three/tsl";

const EPSILON = 1e-6;

/**
 * addForce.glsl を TSL に移植したフラグメントロジック。
 */
export const addForce = /*#__PURE__*/ Fn(
  ([
    textureNodeInput,
    texelSizeNode,
    forceCenterNode,
    forceDeltaVNode,
    forceRadiusNode,
    elasticityNode,
    uvNodeInput,
  ]: [Node, Node, Node, Node, Node, Node, Node]) => {
    const textureNode = convertToTexture(textureNodeInput);
    const texelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);
    const forceCenter = nodeObject(forceCenterNode) || vec2(0.5, 0.5);
    const forceDeltaV = nodeObject(forceDeltaVNode) || vec2(0.0, 0.0);
    const forceRadius = nodeObject(forceRadiusNode) || float(1.0);
    const elasticity = nodeObject(elasticityNode) || float(1.0);
    const uvNode = nodeObject(uvNodeInput) || textureNode.uvNode || uv();

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
    const reflected = applyReflectiveBoundary(uvNode, texelSize, injected, elasticity);

    return vec4(reflected.x, reflected.y, data.z, data.w);
  },
);
