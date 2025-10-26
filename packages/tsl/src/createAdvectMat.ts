import { clamp, min, uniform, uniformTexture, uv, vec2, vec4 } from "three/tsl";

import * as THREE from "three";
import { NodeMaterial } from "three/webgpu";
import { createVertex } from "./createVertex";
import { assignUniforms } from "./utils/assignUniforms";

/**
 * TSL port of advect.glsl. Returns vec4(U, V, pressure, divergence).
 */
export const createAdvectMat = () => {
  const uData = uniformTexture(new THREE.Texture());
  const uTexelSize = uniform(new THREE.Vector2());
  const uDissipation = uniform(0.99);
  const uDeltaT = uniform(0.01);
  const uvNode = uv();

  const ratio = uTexelSize.div(min(uTexelSize.x, uTexelSize.y));
  const data = uData.sample(uvNode);

  const backUv = uvNode.sub(data.xy.mul(uDeltaT).mul(ratio)).toVar();
  const minUv = uTexelSize.mul(0.5);
  const maxUv = vec2(1.0, 1.0).sub(minUv);
  backUv.assign(clamp(backUv, minUv, maxUv));

  const advected = uData.sample(backUv).xy.mul(uDissipation);
  const frag = vec4(advected.x, advected.y, data.z, data.w);
  const vert = createVertex();

  const material = new NodeMaterial();
  material.vertexNode = vert;
  material.fragmentNode = frag;

  return assignUniforms(material, {
    uData,
    uTexelSize,
    uDissipation,
    uDeltaT,
  });
};
