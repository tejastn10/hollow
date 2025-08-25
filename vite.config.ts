import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
	main: {
		plugins: [externalizeDepsPlugin()],
		build: {
			rollupOptions: {
				output: {
					manualChunks: undefined,
				},
			},
		},
		server: { hmr: true },
	},
	preload: {
		plugins: [externalizeDepsPlugin()],
	},
	renderer: {
		resolve: {
			alias: {
				"@renderer": resolve("src/renderer/src"),
			},
		},
		plugins: [react()],
		assetsInclude: ["**/*.png", "**/*.jpg", "**/*.svg"],
		server: {
			hmr: {
				protocol: "ws",
				host: "localhost",
			},
			watch: {
				usePolling: true,
				interval: 100,
			},
		},
	},
});
