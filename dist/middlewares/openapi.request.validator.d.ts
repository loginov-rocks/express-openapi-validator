import * as Ajv from 'ajv';
import { Request } from 'express';
export declare class RequestValidator {
    private _middlewareCache;
    private _apiDocs;
    private ajv;
    constructor(apiDocs: any, options?: {});
    initAjv(options: any): Ajv.Ajv;
    validate(req: any, res: any, next: any, ignore?: (req: Request) => boolean): any;
    private extractContentType;
    private buildMiddleware;
    private requestBodyToSchema;
    private parametersToSchema;
}
