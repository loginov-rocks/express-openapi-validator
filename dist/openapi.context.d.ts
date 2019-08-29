import { OpenAPIFrameworkArgs } from './framework';
export declare class OpenApiContext {
    expressRouteMap: {};
    openApiRouteMap: {};
    routes: any[];
    apiDoc: any;
    private basePaths;
    constructor(opts: OpenAPIFrameworkArgs);
    private initializeRoutes;
    isManagedRoute(path: any): boolean;
    routePair(route: any): {
        expressRoute: any;
        openApiRoute: any;
    };
    methods(route: any): any;
    schema(route: any, method: any): any;
}
