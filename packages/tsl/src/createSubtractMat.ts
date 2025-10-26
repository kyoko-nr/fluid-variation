import { uv, vec2, vec4, uniform, uniformTexture } from "three/tsl";
import * as THREE from "three";
import { sampleNeighborPressureNeumann } from "./utils/sampleNeighborPressureNeumann";
import { createVertex } from "./createVertex";
import { NodeMaterial } from "three/webgpu";
import { assignUniforms } from "./utils/assignUniforms";

/**
 * Removes the pressure gradient from the velocity field.
 */
export const createSubtractMat = () => {
  const uData = uniformTexture(new THREE.Texture());
  const uTexelSize = uniform(new THREE.Vector2(1, 1));
  const uDeltaT = uniform(0.001);
  const uvNode = uv();
  const data = uData.sample(uvNode);

  const left = sampleNeighborPressureNeumann(uData, uvNode, uTexelSize, vec2(-1.0, 0.0), data.z);
  const right = sampleNeighborPressureNeumann(uData, uvNode, uTexelSize, vec2(1.0, 0.0), data.z);
  const up = sampleNeighborPressureNeumann(uData, uvNode, uTexelSize, vec2(0.0, -1.0), data.z);
  const down = sampleNeighborPressureNeumann(uData, uvNode, uTexelSize, vec2(0.0, 1.0), data.z);

  const grad = vec2(right.sub(left), down.sub(up)).mul(0.5);
  const vel = data.xy.sub(grad.mul(uDeltaT));

  const frag = vec4(vel.x, vel.y, data.z, data.w);
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
