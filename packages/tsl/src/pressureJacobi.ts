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

interface PressureJacobiOptions {
	texelSize: unknown;
	uvNode?: unknown;
}

/**
 * Jacobi pressure solve translated to TSL.
 */
export const pressureJacobi = /*#__PURE__*/ Fn(
	([textureNodeInput, options = {} as PressureJacobiOptions]) => {
		const textureNode = convertToTexture(textureNodeInput);
		const texelSize = nodeObject(options.texelSize) || vec2(1.0, 1.0);
		const uvNode = nodeObject(options.uvNode) || textureNode.uvNode || uv();
		const data = textureNode.sample(uvNode);

		const step = float(2.0);

		const left = sampleNeighborPressureNeumann(
			textureNode,
			uvNode,
			texelSize,
			vec2(step.negate(), 0.0),
			data.z,
		);
		const right = sampleNeighborPressureNeumann(
			textureNode,
			uvNode,
			texelSize,
			vec2(step, 0.0),
			data.z,
		);
		const up = sampleNeighborPressureNeumann(
			textureNode,
			uvNode,
			texelSize,
			vec2(0.0, step.negate()),
			data.z,
		);
		const down = sampleNeighborPressureNeumann(
			textureNode,
			uvNode,
			texelSize,
			vec2(0.0, step),
			data.z,
		);

		const pressure = left.add(right).add(up).add(down).sub(data.w).mul(0.25);
		return vec4(data.x, data.y, pressure, data.w);
	},
);
