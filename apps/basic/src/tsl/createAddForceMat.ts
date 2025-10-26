import { applyReflectiveBoundary, assignUniforms, createVertex } from "@fluid/tsl";
import { float, max, min, uniform, uniformTexture, uv, vec2, vec4 } from "three/tsl";
import * as THREE from "three";
import { simulationConfig } from "../gui";
import { NodeMaterial } from "three/webgpu";

const EPSILON = 1e-6;

/**
 * addForce.glsl を TSL に移植したフラグメントロジック。
 */
export const createAddForceMat = () => {
  const uData = uniformTexture(new THREE.Texture());
  const uTexelSize = uniform(new THREE.Vector2());
  const uForceCenter = uniform(new THREE.Vector2());
  const uForceDeltaV = uniform(new THREE.Vector2());
  const uForceRadius = uniform(simulationConfig.forceRadius);

  const uvNode = uv();

  const data = uData.sample(uvNode);
  const radius = vec2(uForceRadius).mul(uTexelSize);
  const safeRadius = max(radius, vec2(EPSILON, EPSILON));
  const nd = uvNode.sub(uForceCenter).div(safeRadius);
  const len = nd.length();
  const falloff = float(1.0)
    .sub(min(len, float(1.0)))
    .toVar();
  falloff.assign(falloff.mul(falloff));

  const injected = data.xy.add(uForceDeltaV.mul(falloff));
  const reflected = applyReflectiveBoundary(uvNode, uTexelSize, injected, 1.0);

  const frag = vec4(reflected.x, reflected.y, data.z, data.w);
  const vert = createVertex();

  const material = new NodeMaterial();
  material.fragmentNode = frag;
  material.vertexNode = vert;

  return assignUniforms(material, {
    uData,
    uTexelSize,
    uForceCenter,
    uForceDeltaV,
    uForceRadius,
  });
};
