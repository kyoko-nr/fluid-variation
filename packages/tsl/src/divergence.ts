import {
	Fn,
	convertToTexture,
	float,
	nodeObject,
	uv,
	vec2,
	vec4,
} from "three/tsl";
import { sampleNeighborVelocityReflect } from "./utils/sampleNeighborVelocityReflect";

interface DivergenceOptions {
	texelSize: unknown;
	deltaT?: unknown;
	uvNode?: unknown;
}

/**
 * TSL port of divergence.glsl. Computes the divergence term.
 */
export const divergence = /*#__PURE__*/ Fn(
	([textureNodeInput, options = {} as DivergenceOptions]) => {
		const textureNode = convertToTexture(textureNodeInput);
		const texelSize = nodeObject(options.texelSize) || vec2(1.0, 1.0);
		const deltaT = nodeObject(options.deltaT) || float(1.0);
		const uvNode = nodeObject(options.uvNode) || textureNode.uvNode || uv();

		const data = textureNode.sample(uvNode);

		const left = sampleNeighborVelocityReflect(
			textureNode,
			uvNode,
			texelSize,
			vec2(-1.0, 0.0),
			data.xy,
		).x;
		const right = sampleNeighborVelocityReflect(
			textureNode,
			uvNode,
			texelSize,
			vec2(1.0, 0.0),
			data.xy,
		).x;
		const up = sampleNeighborVelocityReflect(
			textureNode,
			uvNode,
			texelSize,
			vec2(0.0, -1.0),
			data.xy,
		).y;
		const down = sampleNeighborVelocityReflect(
			textureNode,
			uvNode,
			texelSize,
			vec2(0.0, 1.0),
			data.xy,
		).y;

		const div = right.sub(left).add(down.sub(up)).mul(0.5);

		return vec4(data.x, data.y, data.z, div.div(deltaT));
	},
);
