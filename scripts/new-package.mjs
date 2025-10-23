import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const name = process.argv[2];
if (!name) {
  console.error("Usage: pnpm new:pkg <name>");
  process.exit(1);
}

const base = `packages/${name}`;
mkdirSync(`${base}/src`, { recursive: true });

writeFileSync(
  `${base}/package.json`,
  JSON.stringify(
    {
      name: `@fluid/${name}`,
      version: "0.0.0",
      type: "module",
      main: "./dist/index.js",
      types: "./dist/index.d.ts",
      scripts: { build: "tsc -p tsconfig.build.json" }
    },
    null,
    2
  )
);

writeFileSync(
  `${base}/tsconfig.build.json`,
  JSON.stringify(
    {
      extends: "../../tsconfig.base.json",
      compilerOptions: { rootDir: "src", outDir: "dist" },
      include: ["src"]
    },
    null,
    2
  )
);

writeFileSync(`${base}/src/index.ts`, `export {};`);

console.log(`✅ Created ${base}`);
