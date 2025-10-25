import { Fn, nodeObject, uv, vec2, abs, fract } from "three/tsl";

/**
 * Keeps UV coordinates inside the [0, 1] range using mirror repeat tiling.
 */
export const mirrorRepeatUv = /*#__PURE__*/ Fn(([uvNode, texelSizeNode]) => {
	const value = nodeObject(uvNode) || uv();
	const texelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);

	const uvMin = texelSize.mul(0.5);
	const uvMax = vec2(1.0, 1.0).sub(uvMin);
	const span = uvMax.sub(uvMin);

	const t = value.sub(uvMin).div(span);
	const tri = vec2(1.0, 1.0).sub(
		abs(vec2(1.0, 1.0).sub(fract(t.mul(0.5)).mul(2.0))),
	);

	return uvMin.add(tri.mul(span));
});
