import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { join } from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@": join(__dirname, "./src/"),
        },
    },
    build: {
        lib: {
            entry: "src/main.ts",
            formats: ["iife"],
            fileName: () => "npu-ng.user.js",
            name: "NpuNG",
        },
        outDir: "dist",
        emptyOutDir: true,
    },
    plugins: [
        {
            name: "userscript-plugin",
            generateBundle(_, bundle) {
                const header = readFileSync(join(__dirname, "src", "meta-header.txt"))
                    .toString("utf-8")
                    .replace(
                        "%%%VERSION%%%",
                        JSON.stringify(process.env.npm_package_version).replace(/"/g, ""),
                    );

                for (const filename of Object.keys(bundle)) {
                    const chunk = bundle[filename];
                    if (chunk.type === "chunk" && chunk.fileName === "npu-ng.user.js") {
                        chunk.code = header + "\n" + chunk.code;
                    }
                }
            },
        },
    ],
});
