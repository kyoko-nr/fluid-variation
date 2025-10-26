import type { NodeMaterial } from "three/webgpu";
import type { Uniform } from "three/webgpu";

export type NodeWithUniformMaterial = NodeMaterial & { uniforms?: Record<string, Uniform> };
