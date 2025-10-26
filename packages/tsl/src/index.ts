export { createAdvectMat } from "./createAdvectMat";
export { createDivergenceMat } from "./createDivergenceMat";
export { createPressureMat } from "./createPressureMat";
export { createSubtractMat } from "./createSubtractMat";
export { createVertex } from "./createVertex";

export { applyReflectiveBoundary } from "./utils/applyReflectiveBoundary";
export { mirrorRepeatUv } from "./utils/mirrorRepeatUv";
export { sampleBilinear4 } from "./utils/sampleBilinear4";
export { sampleNeighborPressureNeumann } from "./utils/sampleNeighborPressureNeumann";
export { sampleNeighborVelocityReflect } from "./utils/sampleNeighborVelocityReflect";
export { assignUniforms } from "./utils/assignUniforms";

export type { MaterialWithUniform } from "./types/type";
