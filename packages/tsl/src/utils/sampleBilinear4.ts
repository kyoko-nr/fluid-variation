import { Fn, clamp, convertToTexture, floor, mix, nodeObject, uv, vec2 } from "three/tsl";
import type Node from "three/src/nodes/core/Node.js";

/**
 * Manual bilinear sampling helper to match the GLSL implementation.
 */
export const sampleBilinear4 = /*#__PURE__*/ Fn(
  ([textureNodeInput, uvNode, texelSizeNode]: [Node, Node, Node]) => {
    const uTexture = convertToTexture(textureNodeInput);
    const uUv = nodeObject(uvNode) || uTexture.uvNode || uv();
    const uTexelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);

    const cell = floor(uUv.div(uTexelSize).sub(0.5));
    const uv00 = clamp(
      cell.add(0.5).mul(uTexelSize),
      uTexelSize.mul(0.5),
      vec2(1.0, 1.0).sub(uTexelSize.mul(1.5)),
    );
    const uv10 = uv00.add(vec2(uTexelSize.x, 0.0));
    const uv01 = uv00.add(vec2(0.0, uTexelSize.y));
    const uv11 = uv00.add(uTexelSize);

    const c00 = uTexture.sample(uv00);
    const c10 = uTexture.sample(uv10);
    const c01 = uTexture.sample(uv01);
    const c11 = uTexture.sample(uv11);

    const f = clamp(uUv.sub(uv00).div(uTexelSize), 0.0, 1.0);
    const cx0 = mix(c00, c10, f.x);
    const cx1 = mix(c01, c11, f.x);

    return mix(cx0, cx1, f.y);
  },
);
