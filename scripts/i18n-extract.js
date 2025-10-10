#!/usr/bin/env node
import {promises as fs} from "fs";
import * as fsSync from "fs";
import path from "path";

/**
 * Read argument --locales:
 * - First tries globalThis.global.process.env.npm_config_locales (npm sends --locales=... here)
 * - Then tries argv (--locales=value or --locales value)
 */
function readLocalesArg() {
    const envVal = globalThis.global.process.env.npm_config_locales;
    if (envVal && String(envVal).trim()) return String(envVal);

    const argv = globalThis.global.process.argv.slice(2);
    const idx = argv.findIndex(
        (a) => a === "--locales" || a.startsWith("--locales=")
    );
    if (idx === -1) return null;
    if (argv[idx].includes("=")) return argv[idx].split("=")[1] ?? null;
    return argv[idx + 1] ?? null;
}

function parseLocales(raw) {
    if (!raw) return [];
    return raw
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
}

async function updateLocalesFile(newLocales) {
    const filePath = path.resolve(globalThis.global.process.cwd(), "locales.json");
    let data = {locales: []};

    // make sure the file exists
    if (!fsSync.existsSync(filePath)) {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    }

    // now try to read the contents
    try {
        const txt = await fs.readFile(filePath, "utf8");
        const parsed = JSON.parse(txt);
        if (parsed && Array.isArray(parsed.locales)) {
            data.locales = parsed.locales.slice();
        }
    } catch {
        // if the content is invalid, recreate empty
        data = {locales: []};
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    }

    // add the new locales
    for (const loc of newLocales) {
        if (!data.locales.includes(loc)) data.locales.push(loc);
    }

    // always overwrite with the updated version
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    return data.locales;
}

function runI18nextParser() {
    const cmd = "npx";
    const args = ["i18next-parser", "--config", "i18next-parser.config.cjs"];
    const res = globalThis.spawnSync(cmd, args, {stdio: "inherit", shell: true});
    return res.status ?? 1;
}

(async function main() {
    try {
        const raw = readLocalesArg();
        const locales = parseLocales(raw);

        if (locales.length) {
            const updated = await updateLocalesFile(locales);
            globalThis.global.console.log(`✅ locales.json updated: [${updated.join(", ")}]`);
        } else {
            globalThis.global.console.log("ℹ️ no --locales provided; skipping locales.json update.");
        }

        const exitCode = runI18nextParser();
        globalThis.global.process.exit(exitCode);
    } catch (err) {
        globalThis.global.console.error("❌ i18n-extract failed:", err);
        globalThis.global.process.exit(1);
    }
})();
