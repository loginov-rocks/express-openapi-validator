import { Request } from 'express';
import { Logger } from 'ts-log';
import BasePath from './base.path';
export { OpenAPIFrameworkArgs, OpenAPIFrameworkConstructorArgs, OpenAPIErrorTransformer, };
declare type OpenAPIErrorTransformer = ({}: {}, {}: {}) => object;
declare type PathSecurityTuple = [RegExp, SecurityRequirement[]];
interface SecurityRequirement {
    [name: string]: SecurityScope[];
}
declare type SecurityScope = string;
export declare namespace OpenAPIV3 {
    interface Document {
        openapi: string;
        info: InfoObject;
        servers?: ServerObject[];
        paths: PathsObject;
        components?: ComponentsObject;
        security?: SecurityRequirementObject[];
        tags?: TagObject[];
        externalDocs?: ExternalDocumentationObject;
    }
    interface InfoObject {
        title: string;
        description?: string;
        termsOfService?: string;
        contact?: ContactObject;
        license?: LicenseObject;
        version: string;
    }
    interface ContactObject {
        name?: string;
        url?: string;
        email?: string;
    }
    interface LicenseObject {
        name: string;
        url?: string;
    }
    interface ServerObject {
        url: string;
        description?: string;
        variables?: {
            [variable: string]: ServerVariableObject;
        };
    }
    interface ServerVariableObject {
        enum?: string[];
        default: string;
        description?: string;
    }
    interface PathsObject {
        [pattern: string]: PathItemObject;
    }
    interface PathItemObject {
        $ref?: string;
        summary?: string;
        description?: string;
        get?: OperationObject;
        put?: OperationObject;
        post?: OperationObject;
        delete?: OperationObject;
        options?: OperationObject;
        head?: OperationObject;
        patch?: OperationObject;
        trace?: OperationObject;
        servers?: ServerObject[];
        parameters?: Array<ReferenceObject | ParameterObject>;
    }
    interface OperationObject {
        tags?: string[];
        summary?: string;
        description?: string;
        externalDocs?: ExternalDocumentationObject;
        operationId?: string;
        parameters?: Array<ReferenceObject | ParameterObject>;
        requestBody?: ReferenceObject | RequestBodyObject;
        responses?: ResponsesObject;
        callbacks?: {
            [callback: string]: ReferenceObject | CallbackObject;
        };
        deprecated?: boolean;
        security?: SecurityRequirementObject[];
        servers?: ServerObject[];
    }
    interface ExternalDocumentationObject {
        description?: string;
        url: string;
    }
    interface ParameterObject extends ParameterBaseObject {
        name: string;
        in: string;
    }
    interface HeaderObject extends ParameterBaseObject {
    }
    interface ParameterBaseObject {
        description?: string;
        required?: boolean;
        deprecated?: boolean;
        allowEmptyValue?: boolean;
        style?: string;
        explode?: boolean;
        allowReserved?: boolean;
        schema?: ReferenceObject | SchemaObject;
        example?: any;
        examples?: {
            [media: string]: ReferenceObject | ExampleObject;
        };
        content?: {
            [media: string]: MediaTypeObject;
        };
    }
    type NonArraySchemaObjectType = 'null' | 'boolean' | 'object' | 'number' | 'string' | 'integer';
    type ArraySchemaObjectType = 'array';
    type SchemaObject = ArraySchemaObject | NonArraySchemaObject;
    interface ArraySchemaObject extends BaseSchemaObject {
        type: ArraySchemaObjectType;
        items: ReferenceObject | SchemaObject;
    }
    interface NonArraySchemaObject extends BaseSchemaObject {
        type: NonArraySchemaObjectType;
    }
    interface BaseSchemaObject {
        title?: string;
        description?: string;
        format?: string;
        default?: any;
        multipleOf?: number;
        maximum?: number;
        exclusiveMaximum?: boolean;
        minimum?: number;
        exclusiveMinimum?: boolean;
        maxLength?: number;
        minLength?: number;
        pattern?: string;
        additionalProperties?: boolean | ReferenceObject | SchemaObject;
        maxItems?: number;
        minItems?: number;
        uniqueItems?: boolean;
        maxProperties?: number;
        minProperties?: number;
        required?: string[];
        enum?: any[];
        properties?: {
            [name: string]: ReferenceObject | SchemaObject;
        };
        allOf?: Array<ReferenceObject | SchemaObject>;
        oneOf?: Array<ReferenceObject | SchemaObject>;
        anyOf?: Array<ReferenceObject | SchemaObject>;
        not?: ReferenceObject | SchemaObject;
        nullable?: boolean;
        discriminator?: DiscriminatorObject;
        readOnly?: boolean;
        writeOnly?: boolean;
        xml?: XMLObject;
        externalDocs?: ExternalDocumentationObject;
        example?: any;
        deprecated?: boolean;
    }
    interface DiscriminatorObject {
        propertyName: string;
        mapping?: {
            [value: string]: string;
        };
    }
    interface XMLObject {
        name?: string;
        namespace?: string;
        prefix?: string;
        attribute?: boolean;
        wrapped?: boolean;
    }
    interface ReferenceObject {
        $ref: string;
    }
    interface ExampleObject {
        summary?: string;
        description?: string;
        value?: any;
        externalValue?: string;
    }
    interface MediaTypeObject {
        schema?: ReferenceObject | SchemaObject;
        example?: any;
        examples?: {
            [media: string]: ReferenceObject | ExampleObject;
        };
        encoding?: {
            [media: string]: EncodingObject;
        };
    }
    interface EncodingObject {
        contentType?: string;
        headers?: {
            [header: string]: ReferenceObject | HeaderObject;
        };
        style?: string;
        explode?: boolean;
        allowReserved?: boolean;
    }
    interface RequestBodyObject {
        description?: string;
        content: {
            [media: string]: MediaTypeObject;
        };
        required?: boolean;
    }
    interface ResponsesObject {
        [code: string]: ReferenceObject | ResponseObject;
    }
    interface ResponseObject {
        description: string;
        headers?: {
            [header: string]: ReferenceObject | HeaderObject;
        };
        content?: {
            [media: string]: MediaTypeObject;
        };
        links?: {
            [link: string]: ReferenceObject | LinkObject;
        };
    }
    interface LinkObject {
        operationRef?: string;
        operationId?: string;
        parameters?: {
            [parameter: string]: any;
        };
        requestBody?: any;
        description?: string;
        server?: ServerObject;
    }
    interface CallbackObject {
        [url: string]: PathItemObject;
    }
    interface SecurityRequirementObject {
        [name: string]: string[];
    }
    interface ComponentsObject {
        schemas?: {
            [key: string]: ReferenceObject | SchemaObject;
        };
        responses?: {
            [key: string]: ReferenceObject | ResponseObject;
        };
        parameters?: {
            [key: string]: ReferenceObject | ParameterObject;
        };
        examples?: {
            [key: string]: ReferenceObject | ExampleObject;
        };
        requestBodies?: {
            [key: string]: ReferenceObject | RequestBodyObject;
        };
        headers?: {
            [key: string]: ReferenceObject | HeaderObject;
        };
        securitySchemes?: {
            [key: string]: ReferenceObject | SecuritySchemeObject;
        };
        links?: {
            [key: string]: ReferenceObject | LinkObject;
        };
        callbacks?: {
            [key: string]: ReferenceObject | CallbackObject;
        };
    }
    type SecuritySchemeObject = HttpSecurityScheme | ApiKeySecurityScheme | OAuth2SecurityScheme | OpenIdSecurityScheme;
    interface HttpSecurityScheme {
        type: 'http';
        description?: string;
        scheme: string;
        bearerFormat?: string;
    }
    interface ApiKeySecurityScheme {
        type: 'apiKey';
        description?: string;
        name: string;
        in: string;
    }
    interface OAuth2SecurityScheme {
        type: 'oauth2';
        flows: {
            implicit?: {
                authorizationUrl: string;
                refreshUrl?: string;
                scopes: {
                    [scope: string]: string;
                };
            };
            password?: {
                tokenUrl: string;
                refreshUrl?: string;
                scopes: {
                    [scope: string]: string;
                };
            };
            clientCredentials?: {
                tokenUrl: string;
                refreshUrl?: string;
                scopes: {
                    [scope: string]: string;
                };
            };
            authorizationCode?: {
                authorizationUrl: string;
                tokenUrl: string;
                refreshUrl?: string;
                scopes: {
                    [scope: string]: string;
                };
            };
        };
    }
    interface OpenIdSecurityScheme {
        type: 'openIdConnect';
        description?: string;
        openIdConnectUrl: string;
    }
    interface TagObject {
        name: string;
        description?: string;
        externalDocs?: ExternalDocumentationObject;
    }
}
export interface OpenAPIFrameworkPathObject {
    path?: string;
    module?: any;
}
export interface IOpenAPIFramework {
    featureType: string;
    loggingPrefix: string;
    name: string;
}
interface OpenAPIFrameworkConstructorArgs extends OpenAPIFrameworkArgs {
    featureType: string;
    name: string;
}
interface OpenAPIFrameworkArgs {
    apiDoc: OpenAPIV3.Document | string;
    customFormats?: {
        string: (arg: any) => boolean;
    };
    dependencies?: {
        [service: string]: any;
    };
    enableObjectCoercion?: boolean;
    errorTransformer?: OpenAPIErrorTransformer;
    externalSchemas?: {
        string: IJsonSchema;
    };
    pathSecurity?: PathSecurityTuple[];
    operations?: {
        [operationId: string]: (...arg: any[]) => any;
    };
    paths?: string | OpenAPIFrameworkPathObject[];
    pathsIgnore?: RegExp;
    routesGlob?: string;
    routesIndexFileRegExp?: RegExp;
    validateApiDoc?: boolean;
    logger?: Logger;
}
export interface OpenAPIFrameworkAPIContext {
    basePaths: BasePath[];
    getApiDoc(): any;
}
export interface OpenAPIFrameworkPathContext {
    basePaths: BasePath[];
    getApiDoc(): any;
    getPathDoc(): any;
}
export interface OpenAPIFrameworkVisitor {
    visitApi?(context: OpenAPIFrameworkAPIContext): void;
    visitPath?(context: OpenAPIFrameworkPathContext): void;
}
export interface OpenApiRequest extends Request {
    openapi: any;
}
export interface IJsonSchema {
    id?: string;
    $schema?: string;
    title?: string;
    description?: string;
    multipleOf?: number;
    maximum?: number;
    exclusiveMaximum?: boolean;
    minimum?: number;
    exclusiveMinimum?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: string;
    additionalItems?: boolean | IJsonSchema;
    items?: IJsonSchema | IJsonSchema[];
    maxItems?: number;
    minItems?: number;
    uniqueItems?: boolean;
    maxProperties?: number;
    minProperties?: number;
    required?: string[];
    additionalProperties?: boolean | IJsonSchema;
    definitions?: {
        [name: string]: IJsonSchema;
    };
    properties?: {
        [name: string]: IJsonSchema;
    };
    patternProperties?: {
        [name: string]: IJsonSchema;
    };
    dependencies?: {
        [name: string]: IJsonSchema | string[];
    };
    enum?: any[];
    type?: string | string[];
    allOf?: IJsonSchema[];
    anyOf?: IJsonSchema[];
    oneOf?: IJsonSchema[];
    not?: IJsonSchema;
}
export declare class ConsoleDebugAdapterLogger implements Logger {
    /**
     * `console.debug` is just an alias for `.log()`, and we want debug logging to be optional.
     * This class delegates to `console` and overrides `.debug()` to be a no-op.
     */
    debug(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    info(message?: any, ...optionalParams: any[]): void;
    trace(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
}
