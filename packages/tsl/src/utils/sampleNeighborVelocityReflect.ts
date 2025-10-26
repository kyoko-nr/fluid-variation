import { Fn, convertToTexture, nodeObject, uv, vec2, If } from "three/tsl";
import type Node from "three/src/nodes/core/Node.js";

/**
 * Samples neighbor velocity while reflecting the normal component at the borders.
 */
export const sampleNeighborVelocityReflect = /*#__PURE__*/ Fn(
  ([textureNodeInput, uvNode, texelSizeNode, dirNode, centerVelocityNode]: [
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
    const uCenterVelocity = nodeObject(centerVelocityNode) || vec2(0.0, 0.0);

    const edge = uTexelSize.mul(0.5);
    const maxUV = vec2(1.0, 1.0).sub(edge);

    const offset = uUv.add(uDir.mul(uTexelSize));
    const neighbor = uTexture.sample(offset).xy.toVar();

    If(uUv.x.lessThanEqual(edge.x).and(uDir.x.lessThan(0.0)), () => {
      neighbor.assign(vec2(uCenterVelocity.x.negate(), uCenterVelocity.y));
    });
    If(uUv.x.greaterThanEqual(maxUV.x).and(uDir.x.greaterThan(0.0)), () => {
      neighbor.assign(vec2(uCenterVelocity.x.negate(), uCenterVelocity.y));
    });
    If(uUv.y.lessThanEqual(edge.y).and(uDir.y.lessThan(0.0)), () => {
      neighbor.assign(vec2(uCenterVelocity.x, uCenterVelocity.y.negate()));
    });
    If(uUv.y.greaterThanEqual(maxUV.y).and(uDir.y.greaterThan(0.0)), () => {
      neighbor.assign(vec2(uCenterVelocity.x, uCenterVelocity.y.negate()));
    });

    return neighbor;
  },
);
