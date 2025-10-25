import {
	Fn,
	convertToTexture,
	float,
	nodeObject,
	uv,
	vec2,
	vec4,
} from "three/tsl";
import { sampleNeighborPressureNeumann } from "./utils/sampleNeighborPressureNeumann";

interface SubtractGradientOptions {
	texelSize: unknown;
	deltaT?: unknown;
	uvNode?: unknown;
}

/**
 * Removes the pressure gradient from the velocity field.
 */
export const subtractGradient = /*#__PURE__*/ Fn(
	([textureNodeInput, options = {} as SubtractGradientOptions]) => {
		const textureNode = convertToTexture(textureNodeInput);
		const texelSize = nodeObject(options.texelSize) || vec2(1.0, 1.0);
		const deltaT = nodeObject(options.deltaT) || float(1.0);
		const uvNode = nodeObject(options.uvNode) || textureNode.uvNode || uv();
		const data = textureNode.sample(uvNode);

		const left = sampleNeighborPressureNeumann(
			textureNode,
			uvNode,
			texelSize,
			vec2(-1.0, 0.0),
			data.z,
		);
		const right = sampleNeighborPressureNeumann(
			textureNode,
			uvNode,
			texelSize,
			vec2(1.0, 0.0),
			data.z,
		);
		const up = sampleNeighborPressureNeumann(
			textureNode,
			uvNode,
			texelSize,
			vec2(0.0, -1.0),
			data.z,
		);
		const down = sampleNeighborPressureNeumann(
			textureNode,
			uvNode,
			texelSize,
			vec2(0.0, 1.0),
			data.z,
		);

		const grad = vec2(right.sub(left), down.sub(up)).mul(0.5);
		const vel = data.xy.sub(grad.mul(deltaT));

		return vec4(vel.x, vel.y, data.z, data.w);
	},
);
