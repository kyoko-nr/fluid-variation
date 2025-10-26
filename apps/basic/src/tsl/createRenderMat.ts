import { float, mix, uv, vec2, vec4, uniformTexture, uniform } from "three/tsl";
import * as THREE from "three";
import { simulationConfig } from "../gui";
import { assignUniforms, createVertex } from "@fluid/tsl";
import { NodeMaterial } from "three/webgpu";
/**
 * render.glsl を TSL 化。速度の大きさに応じて色を補間する。
 */
export const createRenderMat = () => {
  const uTexture = uniformTexture(new THREE.Texture());
  const uColorStrength = uniform(simulationConfig.colorStrength);
  const uBgColor = uniform(simulationConfig.bgColor);
  const uFluidColor = uniform(simulationConfig.fluidColor);
  const uvNode = uv();

  const flippedUv = vec2(uvNode.x, float(1.0).sub(uvNode.y));
  const velocity = uTexture.sample(flippedUv).xy;
  const magnitude = velocity.length().mul(uColorStrength);
  const color = mix(uBgColor, uFluidColor, magnitude);

  const frag = vec4(color, 1.0);
  const vert = createVertex();

  const material = new NodeMaterial();
  material.fragmentNode = frag;
  material.vertexNode = vert;

  return assignUniforms(material, {
    uTexture,
    uColorStrength,
    uBgColor,
    uFluidColor,
  });
};
