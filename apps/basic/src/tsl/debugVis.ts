import { Fn, uv, vec2, vec3, vec4, uniformTexture } from "three/tsl";
import * as THREE from "three";
/**
 * デバッグ表示用。速度ベクトルの大きさをグレースケールで表示する。
 */
export const debugVis = Fn(() => {
  const uTexture = uniformTexture(new THREE.Texture());
  const uvNode = uv();

  const data = uTexture.sample(uvNode);
  const magnitude = vec2(data.x, data.y).length();
  const intensity = magnitude.mul(1.0);

  return vec4(vec3(intensity, intensity, intensity), 1.0);
});
