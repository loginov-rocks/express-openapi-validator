import * as Ajv from 'ajv';
export declare class OpenAPISchemaValidator {
    private validator;
    constructor({ version, extensions }: {
        version: any;
        extensions: any;
    });
    validate(openapiDoc: any): {
        errors: Ajv.ErrorObject[];
    };
}
