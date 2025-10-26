import { Fn, float, nodeObject, uv, vec2, If } from "three/tsl";
import type Node from "three/src/nodes/core/Node.js";

/**
 * Reflects the velocity when sampling outside the simulation domain.
 */
export const applyReflectiveBoundary = /*#__PURE__*/ Fn(
  ([uvNode, texelSizeNode, velocityNode, elasticityNode]: [Node, Node, Node, Node]) => {
    const uUv = nodeObject(uvNode) || uv();
    const uTexelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);
    const uVelocity = (nodeObject(velocityNode) || vec2(0.0, 0.0)).toVar();
    const uElasticity = nodeObject(elasticityNode) || float(1.0);

    const edgeUV = uTexelSize.mul(0.5);
    const maxUV = vec2(1.0, 1.0).sub(edgeUV);

    If(uUv.x.lessThanEqual(edgeUV.x).and(uVelocity.x.lessThan(0.0)), () => {
      uVelocity.x.assign(uVelocity.x.negate().mul(uElasticity));
    });

    If(uUv.x.greaterThanEqual(maxUV.x).and(uVelocity.x.greaterThan(0.0)), () => {
      uVelocity.x.assign(uVelocity.x.negate().mul(uElasticity));
    });

    If(uUv.y.lessThanEqual(edgeUV.y).and(uVelocity.y.lessThan(0.0)), () => {
      uVelocity.y.assign(uVelocity.y.negate().mul(uElasticity));
    });

    If(uUv.y.greaterThanEqual(maxUV.y).and(uVelocity.y.greaterThan(0.0)), () => {
      uVelocity.y.assign(uVelocity.y.negate().mul(uElasticity));
    });

    return uVelocity;
  },
);
