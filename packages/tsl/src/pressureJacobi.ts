import { Fn, float, uv, vec2, vec4, uniform, uniformTexture } from "three/tsl";
import * as THREE from "three";
import { sampleNeighborPressureNeumann } from "./utils/sampleNeighborPressureNeumann";

/**
 * Jacobi pressure solve translated to TSL.
 */
export const pressureJacobi = /*#__PURE__*/ Fn(() => {
  const uData = uniformTexture(new THREE.Texture());
  const uTexelSize = uniform(new THREE.Vector2(1, 1));
  const uvNode = uv();
  const data = uData.sample(uvNode);

  const step = float(2.0);

  const left = sampleNeighborPressureNeumann(
    uData,
    uvNode,
    uTexelSize,
    vec2(step.negate(), 0.0),
    data.z,
  );
  const right = sampleNeighborPressureNeumann(uData, uvNode, uTexelSize, vec2(step, 0.0), data.z);
  const up = sampleNeighborPressureNeumann(
    uData,
    uvNode,
    uTexelSize,
    vec2(0.0, step.negate()),
    data.z,
  );
  const down = sampleNeighborPressureNeumann(uData, uvNode, uTexelSize, vec2(0.0, step), data.z);

  const pressure = left.add(right).add(up).add(down).sub(data.w).mul(0.25);
  return vec4(data.x, data.y, pressure, data.w);
});
