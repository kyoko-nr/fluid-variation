import { Fn, float, nodeObject, uv, vec2, If } from "three/tsl";

/**
 * Reflects the velocity when sampling outside the simulation domain.
 */
export const applyReflectiveBoundary = /*#__PURE__*/ Fn(
	([uvNode, texelSizeNode, velocityNode, elasticityNode]) => {
		const uvValue = nodeObject(uvNode) || uv();
		const texelSize = nodeObject(texelSizeNode) || vec2(1.0, 1.0);
		const velocity = (nodeObject(velocityNode) || vec2(0.0, 0.0)).toVar();
		const elasticity = nodeObject(elasticityNode) || float(1.0);

		const edgeUV = texelSize.mul(0.5);
		const maxUV = vec2(1.0, 1.0).sub(edgeUV);

		If(uvValue.x.lessThanEqual(edgeUV.x).and(velocity.x.lessThan(0.0)), () => {
			velocity.x.assign(velocity.x.negate().mul(elasticity));
		});

		If(
			uvValue.x.greaterThanEqual(maxUV.x).and(velocity.x.greaterThan(0.0)),
			() => {
				velocity.x.assign(velocity.x.negate().mul(elasticity));
			},
		);

		If(uvValue.y.lessThanEqual(edgeUV.y).and(velocity.y.lessThan(0.0)), () => {
			velocity.y.assign(velocity.y.negate().mul(elasticity));
		});

		If(
			uvValue.y.greaterThanEqual(maxUV.y).and(velocity.y.greaterThan(0.0)),
			() => {
				velocity.y.assign(velocity.y.negate().mul(elasticity));
			},
		);

		return velocity;
	},
);
