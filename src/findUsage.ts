import path from 'path';
import fs from 'fs/promises';
import { globby } from 'globby';
import { FindNodeModulesImportResult, filterModulesByModuleNames, findNodeModulesImport } from 'find-node-modules-import';

const targetPackages = ['react-bootstrap'];
const basePaths = [
    "C:/_dev/OTF-Web/Packages/Web/Source/OnTheFly.Client.UI"
];
const globs = [
    'app/**/*.{jsx,tsx}'
];

const run = async () => {
    const combined = basePaths.reduce((prev, curr) => {
        return [...prev, ...globs.map(g => path.posix.join(curr, g))];
    }, [] as string[]);
    let results: [string, FindNodeModulesImportResult[], string[]][] = [];
    // const regex = /\{\s*(.+)\s*\}/;

    const promises = combined.map(async glob => {
        const files = await globby(glob);

        const r = files.map(async f => {
            const code = await fs.readFile(f, "utf-8");
            const modules = await findNodeModulesImport(code, path.basename(f));
            const filtered = filterModulesByModuleNames(modules, targetPackages);
            return [f, filtered, filtered.map(m => code.slice(m.statementrange?.[0], m.statementrange?.[1]).match(/\{\s*(.+)\s*\}/s)?.[1]?.replaceAll(/\s\s+/gs," ").trim())] as [string, FindNodeModulesImportResult[], string[]];
        });

        const result = (await Promise.all(r)).filter(a => a[1].length > 0);
        results = [...results, ...result];
    });
    await Promise.all(promises);

    const stripped = results.map(r => {
        let str = r[0];
        basePaths.forEach(bp => str = str.replace(bp, ''))
        return [str, r[1], r[2]] as const;
    })

    targetPackages.forEach(pn => {
        console.log("name|components");
        stripped.forEach(s => {
            const idx = s[1].findIndex(m => m.name === pn);
            console.log(`${s[0]}|${s[2][idx]}`);
        });
    });
};

run();

export default run;