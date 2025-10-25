import { Fn, convertToTexture, nodeObject, uv, vec2, If } from "three/tsl";

/**
 * Samples neighbor velocity while reflecting the normal component at the borders.
 */
export const sampleNeighborVelocityReflect = /*#__PURE__*/ Fn(
	([textureNodeInput, uvNode, texelSizeNode, dirNode, centerVelocityNode]) => {
		const textureNode = convertToTexture(textureNodeInput);
		const uvValue = nodeObject(uvNode) || textureNode.uvNode || uv();
		const texelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);
		const dir = nodeObject(dirNode) || vec2(0.0, 0.0);
		const centerVelocity = nodeObject(centerVelocityNode) || vec2(0.0, 0.0);

		const edge = texelSize.mul(0.5);
		const maxUV = vec2(1.0, 1.0).sub(edge);

		const offset = uvValue.add(dir.mul(texelSize));
		const neighbor = textureNode.sample(offset).xy.toVar();

		If(uvValue.x.lessThanEqual(edge.x).and(dir.x.lessThan(0.0)), () => {
			neighbor.assign(vec2(centerVelocity.x.negate(), centerVelocity.y));
		});
		If(uvValue.x.greaterThanEqual(maxUV.x).and(dir.x.greaterThan(0.0)), () => {
			neighbor.assign(vec2(centerVelocity.x.negate(), centerVelocity.y));
		});
		If(uvValue.y.lessThanEqual(edge.y).and(dir.y.lessThan(0.0)), () => {
			neighbor.assign(vec2(centerVelocity.x, centerVelocity.y.negate()));
		});
		If(uvValue.y.greaterThanEqual(maxUV.y).and(dir.y.greaterThan(0.0)), () => {
			neighbor.assign(vec2(centerVelocity.x, centerVelocity.y.negate()));
		});

		return neighbor;
	},
);
