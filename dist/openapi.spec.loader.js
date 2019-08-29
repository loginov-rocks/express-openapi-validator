"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const framework_1 = require("./framework");
class OpenApiSpecLoader {
    constructor(opts) {
        this.opts = opts;
    }
    load() {
        const framework = this.createFramework(this.opts);
        const apiDoc = framework.apiDoc || {};
        const bps = framework.basePaths || [];
        const basePaths = bps.reduce((acc, bp) => {
            bp.all().forEach(path => acc.add(path));
            return acc;
        }, new Set());
        const routes = this.discoverRoutes(framework, basePaths);
        return {
            apiDoc,
            basePaths,
            routes,
        };
    }
    createFramework(args) {
        const frameworkArgs = Object.assign({ featureType: 'middleware', name: 'express-openapi-validator' }, args);
        const framework = new framework_1.default(frameworkArgs);
        return framework;
    }
    discoverRoutes(framework, basePaths) {
        const routes = [];
        const toExpressParams = this.toExpressParams;
        framework.initialize({
            visitApi(ctx) {
                const apiDoc = ctx.getApiDoc();
                for (const bpa of basePaths) {
                    const bp = bpa.replace(/\/$/, '');
                    for (const [path, methods] of Object.entries(apiDoc.paths)) {
                        for (const [method, schema] of Object.entries(methods)) {
                            if (method === 'parameters') {
                                continue;
                            }
                            const schemaParameters = new Set();
                            (schema.parameters || []).forEach(parameter => schemaParameters.add(parameter));
                            (methods.parameters || []).forEach(parameter => schemaParameters.add(parameter));
                            schema.parameters = Array.from(schemaParameters);
                            const pathParams = new Set();
                            for (const param of schema.parameters) {
                                if (param.in === 'path') {
                                    pathParams.add(param.name);
                                }
                            }
                            const openApiRoute = `${bp}${path}`;
                            const expressRoute = `${openApiRoute}`
                                .split('/')
                                .map(toExpressParams)
                                .join('/');
                            routes.push({
                                expressRoute,
                                openApiRoute,
                                method: method.toUpperCase(),
                                pathParams: Array.from(pathParams),
                                schema,
                            });
                        }
                    }
                }
            },
        });
        return routes;
    }
    toExpressParams(part) {
        return part.replace(/\{([^}]+)}/g, ':$1');
    }
}
exports.OpenApiSpecLoader = OpenApiSpecLoader;
//# sourceMappingURL=openapi.spec.loader.js.map