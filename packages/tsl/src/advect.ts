import {
	Fn,
	clamp,
	convertToTexture,
	float,
	min,
	nodeObject,
	uv,
	vec2,
	vec4,
} from "three/tsl";

interface AdvectOptions {
	texelSize: unknown;
	dissipation?: unknown;
	deltaT?: unknown;
	uvNode?: unknown;
}

/**
 * TSL port of advect.glsl. Returns vec4(U, V, pressure, divergence).
 */
export const advect = /*#__PURE__*/ Fn(
	([textureNodeInput, options = {} as AdvectOptions]) => {
		const textureNode = convertToTexture(textureNodeInput);
		const texelSize = nodeObject(options.texelSize) || vec2(1.0, 1.0);
		const dissipation = nodeObject(options.dissipation) || float(1.0);
		const deltaT = nodeObject(options.deltaT) || float(1.0);
		const uvNode = nodeObject(options.uvNode) || textureNode.uvNode || uv();

		const ratio = texelSize.div(min(texelSize.x, texelSize.y));
		const data = textureNode.sample(uvNode);

		const backUv = uvNode.sub(data.xy.mul(deltaT).mul(ratio)).toVar();
		const minUv = texelSize.mul(0.5);
		const maxUv = vec2(1.0, 1.0).sub(minUv);
		backUv.assign(clamp(backUv, minUv, maxUv));

		const advected = textureNode.sample(backUv).xy.mul(dissipation);
		return vec4(advected.x, advected.y, data.z, data.w);
	},
);
