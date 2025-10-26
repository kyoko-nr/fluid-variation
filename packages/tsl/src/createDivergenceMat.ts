import { uv, vec2, vec4, uniform, uniformTexture } from "three/tsl";
import * as THREE from "three";
import { sampleNeighborVelocityReflect } from "./utils/sampleNeighborVelocityReflect";
import { createVertex } from "./createVertex";
import { NodeMaterial } from "three/webgpu";
import { assignUniforms } from "./utils/assignUniforms";

/**
 * TSL port of divergence.glsl. Computes the divergence term.
 */
export const createDivergenceMat = () => {
  const uData = uniformTexture(new THREE.Texture());
  const uTexelSize = uniform(new THREE.Vector2(1, 1));
  const uDeltaT = uniform(0.001);
  const uvNode = uv();

  const data = uData.sample(uvNode);

  const left = sampleNeighborVelocityReflect(uData, uvNode, uTexelSize, vec2(-1.0, 0.0), data.xy).x;
  const right = sampleNeighborVelocityReflect(uData, uvNode, uTexelSize, vec2(1.0, 0.0), data.xy).x;
  const up = sampleNeighborVelocityReflect(uData, uvNode, uTexelSize, vec2(0.0, -1.0), data.xy).y;
  const down = sampleNeighborVelocityReflect(uData, uvNode, uTexelSize, vec2(0.0, 1.0), data.xy).y;

  const div = right.sub(left).add(down.sub(up)).mul(0.5);

  const frag = vec4(data.x, data.y, data.z, div.div(uDeltaT));
  const vert = createVertex();

  const material = new NodeMaterial();
  material.fragmentNode = frag;
  material.vertexNode = vert;

  return assignUniforms(material, {
    uData,
    uTexelSize,
    uDeltaT,
  });
};
