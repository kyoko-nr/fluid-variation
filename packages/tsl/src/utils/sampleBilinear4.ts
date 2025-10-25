import {
	Fn,
	clamp,
	convertToTexture,
	floor,
	mix,
	nodeObject,
	uv,
	vec2,
} from "three/tsl";

/**
 * Manual bilinear sampling helper to match the GLSL implementation.
 */
export const sampleBilinear4 = /*#__PURE__*/ Fn(
	([textureNodeInput, uvNode, texelSizeNode]) => {
		const textureNode = convertToTexture(textureNodeInput);
		const uvValue = nodeObject(uvNode) || textureNode.uvNode || uv();
		const texelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);

		const cell = floor(uvValue.div(texelSize).sub(0.5));
		const uv00 = clamp(
			cell.add(0.5).mul(texelSize),
			texelSize.mul(0.5),
			vec2(1.0, 1.0).sub(texelSize.mul(1.5)),
		);
		const uv10 = uv00.add(vec2(texelSize.x, 0.0));
		const uv01 = uv00.add(vec2(0.0, texelSize.y));
		const uv11 = uv00.add(texelSize);

		const c00 = textureNode.sample(uv00);
		const c10 = textureNode.sample(uv10);
		const c01 = textureNode.sample(uv01);
		const c11 = textureNode.sample(uv11);

		const f = clamp(uvValue.sub(uv00).div(texelSize), 0.0, 1.0);
		const cx0 = mix(c00, c10, f.x);
		const cx1 = mix(c01, c11, f.x);

		return mix(cx0, cx1, f.y);
	},
);
