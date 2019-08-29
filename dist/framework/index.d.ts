import BasePath from './base.path';
import { IOpenAPIFramework, OpenAPIFrameworkAPIContext, OpenAPIFrameworkArgs, OpenAPIFrameworkConstructorArgs, OpenAPIFrameworkPathContext, OpenAPIFrameworkPathObject, OpenAPIFrameworkVisitor } from './types';
export { BasePath, OpenAPIFrameworkArgs, OpenAPIFrameworkConstructorArgs, OpenAPIFrameworkPathContext, OpenAPIFrameworkPathObject, OpenAPIFrameworkAPIContext, };
export default class OpenAPIFramework implements IOpenAPIFramework {
    protected args: OpenAPIFrameworkConstructorArgs;
    readonly apiDoc: any;
    readonly basePaths: BasePath[];
    readonly featureType: any;
    readonly loggingPrefix: any;
    readonly name: any;
    private originalApiDoc;
    private validateApiDoc;
    private validator;
    private logger;
    constructor(args?: OpenAPIFrameworkConstructorArgs);
    initialize(visitor: OpenAPIFrameworkVisitor): void;
}
