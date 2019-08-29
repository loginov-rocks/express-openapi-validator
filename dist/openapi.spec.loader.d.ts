import { OpenAPIFrameworkArgs } from './framework';
export declare class OpenApiSpecLoader {
    private opts;
    constructor(opts: OpenAPIFrameworkArgs);
    load(): {
        apiDoc: any;
        basePaths: Set<string>;
        routes: any[];
    };
    private createFramework;
    private discoverRoutes;
    private toExpressParams;
}
