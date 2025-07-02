import { defineConfig } from "vite";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import Handlebars from "handlebars";

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
                const templates = generateTemplatesConstant();

                for (const filename of Object.keys(bundle)) {
                    const chunk = bundle[filename];
                    if (chunk.type === "chunk" && chunk.fileName === "npu-ng.user.js") {
                        chunk.code = [header, chunk.code].join("\n");

                        chunk.code = chunk.code.replace(
                            '"use strict";',
                            `"use strict";${templates}`,
                        );
                    }
                }
            },
        },
        // {
        //     name: "template-files-hot-reload",
        //     enforce: "post",
        //     handleHotUpdate({ file, server }) {
        //         if (file.endsWith(".handlebars")) {
        //             console.log("reloading template file...");
        //
        //             server.ws.send({
        //                 type: "full-reload",
        //                 path: "*",
        //             });
        //         }
        //     },
        // },
    ],
});

function generateUserscriptHeader() {
    return readFileSync(join(__dirname, "src", "meta-header.txt"))
        .toString("utf-8")
        .replace("%%%VERSION%%%", appVersion);
}

function generateTemplatesConstant() {
    const dir = join(__dirname, "src", "templates");

    const templateMap = readdirSync(dir)
        .filter((f) => f.endsWith(".handlebars"))
        .reduce(
            (map, filename) => {
                const name = filename.replace(".handlebars", "");
                const content = readFileSync(join(dir, filename)).toString("utf-8").trim();
                const compiled = String(Handlebars.precompile(content))
                    .replace(/\n+/g, "")
                    .replace(/\s+/g, " ");

                const parsed = (() => {
                    const beforeFunc = compiled.substring(0, compiled.indexOf('"main":'));
                    const afterFunc = compiled.substring(compiled.indexOf('"useData":'));

                    const funcText = compiled
                        .replace(beforeFunc, "")
                        .replace(afterFunc, "")
                        .slice(7, -1);

                    return `${(beforeFunc + afterFunc).slice(0, -1)},"main":${funcText}}`;
                })();

                return { ...map, [name]: parsed };
            },
            {} as Record<string, string>,
        );

    const templateMapString = Object.entries(templateMap)
        .reduce((previousValue, [key, value]) => {
            return [...previousValue, `"${key}": ${value}`];
        }, [] as string[])
        .join(",");

    return `const __TEMPLATES__ = {${templateMapString}};`;
}
