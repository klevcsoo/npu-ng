import { defineConfig } from "vite";
import { readFileSync } from "fs";
import { join } from "path";

const appVersion = JSON.stringify(process.env.npm_package_version).replace(/"/g, "");

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
            name: "assets-concatenation-plugin",
            generateBundle(_, bundle) {
                const header = generateUserscriptHeader();

                for (const filename of Object.keys(bundle)) {
                    const chunk = bundle[filename];
                    if (chunk.type === "chunk" && chunk.fileName === "npu-ng.user.js") {
                        chunk.code = [header, chunk.code].join("\n");
                    }
                }
            },
        },
    ],
});

function generateUserscriptHeader() {
    return readFileSync(join(__dirname, "src", "meta-header.txt"))
        .toString("utf-8")
        .replace("%%%VERSION%%%", appVersion);
}
