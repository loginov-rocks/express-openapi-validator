"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_path_1 = require("./base.path");
const fs = require("fs");
const jsYaml = require("js-yaml");
const path = require("path");
function assertRegExpAndSecurity(framework, tuple) {
    if (!Array.isArray(tuple)) {
        throw new Error(`${framework.name}args.pathSecurity expects an array of tuples.`);
    }
    else if (!(tuple[0] instanceof RegExp)) {
        throw new Error(`${framework.name}args.pathSecurity tuples expect the first argument to be a RegExp.`);
    }
    else if (!Array.isArray(tuple[1])) {
        throw new Error(`${framework.name}args.pathSecurity tuples expect the second argument to be a security Array.`);
    }
}
exports.assertRegExpAndSecurity = assertRegExpAndSecurity;
function copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}
exports.copy = copy;
function loadSpecFile(filePath) {
    if (typeof filePath === 'string') {
        const absolutePath = path.resolve(process.cwd(), filePath);
        if (fs.existsSync(absolutePath)) {
            try {
                // json or module
                return require(absolutePath);
            }
            catch (e) {
                return fs.readFileSync(absolutePath, 'utf8');
            }
        }
    }
    return null;
}
exports.loadSpecFile = loadSpecFile;
function handleYaml(apiDoc) {
    return typeof apiDoc === 'string'
        ? jsYaml.safeLoad(apiDoc, { json: true })
        : apiDoc;
}
exports.handleYaml = handleYaml;
function sortApiDocTags(apiDoc) {
    if (apiDoc && Array.isArray(apiDoc.tags)) {
        apiDoc.tags.sort((a, b) => {
            return a.name > b.name;
        });
    }
}
exports.sortApiDocTags = sortApiDocTags;
function getBasePathsFromServers(servers) {
    if (!servers) {
        return [new base_path_1.default({ url: '' })];
    }
    const basePathsMap = {};
    for (const server of servers) {
        const basePath = new base_path_1.default(server);
        basePathsMap[basePath.path] = basePath;
    }
    return Object.keys(basePathsMap).map(key => basePathsMap[key]);
}
exports.getBasePathsFromServers = getBasePathsFromServers;
//# sourceMappingURL=util.js.map