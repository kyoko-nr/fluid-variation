import { Fn, float, convertToTexture, nodeObject, uv, vec2, If } from "three/tsl";
import type Node from "three/src/nodes/core/Node.js";

/**
 * Samples neighbor pressure while enforcing a Neumann boundary (zero gradient).
 */
export const sampleNeighborPressureNeumann = /*#__PURE__*/ Fn(
  ([textureNodeInput, uvNode, texelSizeNode, dirNode, centerValue]: [
    Node,
    Node,
    Node,
    Node,
    Node,
  ]) => {
    const uTexture = convertToTexture(textureNodeInput);
    const uUv = nodeObject(uvNode) || uTexture.uvNode || uv();
    const uTexelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);
    const uDir = nodeObject(dirNode) || vec2(0.0, 0.0);
    const uCenter = nodeObject(centerValue) || float(0.0);

    const edge = uTexelSize.mul(0.5);
    const maxUV = vec2(1.0, 1.0).sub(edge);

    const offset = uUv.add(uDir.mul(uTexelSize));
    const pNeighbor = uTexture.sample(offset).z.toVar();

    If(uUv.x.lessThanEqual(edge.x).and(uDir.x.lessThan(0.0)), () => {
      pNeighbor.assign(uCenter);
    });
    If(uUv.x.greaterThanEqual(maxUV.x).and(uDir.x.greaterThan(0.0)), () => {
      pNeighbor.assign(uCenter);
    });
    If(uUv.y.lessThanEqual(edge.y).and(uDir.y.lessThan(0.0)), () => {
      pNeighbor.assign(uCenter);
    });
    If(uUv.y.greaterThanEqual(maxUV.y).and(uDir.y.greaterThan(0.0)), () => {
      pNeighbor.assign(uCenter);
    });

    return pNeighbor;
  },
);
