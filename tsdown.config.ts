import { defineConfig } from "tsdown";

export default defineConfig({
	exports: { legacy: true },
	outDir: "lib",
});
