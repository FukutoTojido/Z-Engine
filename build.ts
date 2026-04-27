import dts from "bun-plugin-dts";

await Bun.build({
	root: "./src",
	entrypoints: ["src/index.ts"],
	outdir: "./dist",
	plugins: [dts()],
});

console.log("Build complete ✅");
