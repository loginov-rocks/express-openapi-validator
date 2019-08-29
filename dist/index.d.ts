import { Application, Request } from 'express';
import { OpenAPIV3 } from './framework/types';
export interface OpenApiValidatorOpts {
    apiSpecPath?: string;
    apiSpec?: OpenAPIV3.Document | string;
    ignore?: (req: Request) => boolean;
    multerOpts?: {};
}
export declare class OpenApiValidator {
    private context;
    private ignore?;
    private multerOpts;
    constructor(options: OpenApiValidatorOpts);
    install(app: Application): void;
}
