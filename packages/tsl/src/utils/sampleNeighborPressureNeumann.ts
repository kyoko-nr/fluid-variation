import {
	Fn,
	float,
	convertToTexture,
	nodeObject,
	uv,
	vec2,
	If,
} from "three/tsl";

/**
 * Samples neighbor pressure while enforcing a Neumann boundary (zero gradient).
 */
export const sampleNeighborPressureNeumann = /*#__PURE__*/ Fn(
	([textureNodeInput, uvNode, texelSizeNode, dirNode, centerValue]) => {
		const textureNode = convertToTexture(textureNodeInput);
		const uvValue = nodeObject(uvNode) || textureNode.uvNode || uv();
		const texelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);
		const dir = nodeObject(dirNode) || vec2(0.0, 0.0);
		const pCenter = nodeObject(centerValue) || float(0.0);

		const edge = texelSize.mul(0.5);
		const maxUV = vec2(1.0, 1.0).sub(edge);

		const offset = uvValue.add(dir.mul(texelSize));
		const pNeighbor = textureNode.sample(offset).z.toVar();

		If(uvValue.x.lessThanEqual(edge.x).and(dir.x.lessThan(0.0)), () => {
			pNeighbor.assign(pCenter);
		});
		If(uvValue.x.greaterThanEqual(maxUV.x).and(dir.x.greaterThan(0.0)), () => {
			pNeighbor.assign(pCenter);
		});
		If(uvValue.y.lessThanEqual(edge.y).and(dir.y.lessThan(0.0)), () => {
			pNeighbor.assign(pCenter);
		});
		If(uvValue.y.greaterThanEqual(maxUV.y).and(dir.y.greaterThan(0.0)), () => {
			pNeighbor.assign(pCenter);
		});

		return pNeighbor;
	},
);
