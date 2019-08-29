"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Ajv = require("ajv");
const errors_1 = require("../errors");
const ono_1 = require("ono");
const draftSchema = require("ajv/lib/refs/json-schema-draft-04.json");
const TYPE_JSON = 'application/json';
const maxInt32 = Math.pow(2, 31) - 1;
const minInt32 = Math.pow((-2), 31);
const maxInt64 = Math.pow(2, 63) - 1;
const minInt64 = Math.pow((-2), 63);
const maxFloat = (2 - Math.pow(2, -23)) * Math.pow(2, 127);
const minFloat = Math.pow(2, -126);
const alwaysTrue = () => true;
const base64regExp = /^[A-Za-z0-9+/]*(=|==)?$/;
const formats = {
    int32: {
        validate: i => Number.isInteger(i) && i <= maxInt32 && i >= minInt32,
        type: 'number',
    },
    int64: {
        validate: i => Number.isInteger(i) && i <= maxInt64 && i >= minInt64,
        type: 'number',
    },
    float: {
        validate: i => typeof i === 'number' && (i <= maxFloat && i >= minFloat),
        type: 'number',
    },
    double: {
        validate: i => typeof i === 'number',
        type: 'number',
    },
    byte: b => b.length % 4 === 0 && base64regExp.test(b),
    binary: alwaysTrue,
    password: alwaysTrue,
};
class RequestValidator {
    constructor(apiDocs, options = {}) {
        this._middlewareCache = {};
        this._apiDocs = apiDocs;
        this.ajv = this.initAjv(options);
    }
    initAjv(options) {
        const ajv = new Ajv(Object.assign({}, options, { formats: Object.assign({}, formats, options.formats), schemaId: 'auto', allErrors: true, meta: draftSchema }));
        ajv.removeKeyword('propertyNames');
        ajv.removeKeyword('contains');
        ajv.removeKeyword('const');
        /**
         * Remove readOnly property in requestBody when validate.
         * If you want validate response, then need secondary Ajv without modifying this keyword
         * You can probably change this rule so that can't delete readOnly property in response
         */
        ajv.removeKeyword('readOnly');
        ajv.addKeyword('readOnly', {
            modifying: true,
            compile: sch => {
                if (sch) {
                    return (data, path, obj, propName) => {
                        delete obj[propName];
                        return true;
                    };
                }
                return () => true;
            },
        });
        if (this._apiDocs.components.schemas) {
            Object.entries(this._apiDocs.components.schemas).forEach(([id, schema]) => {
                ajv.addSchema(schema, `#/components/schemas/${id}`);
            });
        }
        if (this._apiDocs.components.requestBodies) {
            Object.entries(this._apiDocs.components.requestBodies).forEach(([id, schema]) => {
                // TODO add support for content all content types
                ajv.addSchema(schema.content[TYPE_JSON].schema, `#/components/requestBodies/${id}`);
            });
        }
        return ajv;
    }
    validate(req, res, next, ignore) {
        if (!req.openapi) {
            // this path was not found in open api and
            // this path is not defined under an openapi base path
            // skip it
            return next();
        }
        if (ignore && ignore(req)) {
            return next();
        }
        const path = req.openapi.expressRoute;
        if (!path) {
            const message = 'not found';
            const err = errors_1.validationError(404, req.path, message);
            throw ono_1.default(err, message);
        }
        const pathSchema = req.openapi.schema;
        if (!pathSchema) {
            // add openapi metadata to make this case more clear
            // its not obvious that missig schema means methodNotAllowed
            const message = `${req.method} method not allowed`;
            const err = errors_1.validationError(405, req.path, message);
            throw ono_1.default(err, message);
        }
        // cache middleware by combining method, path, and contentType
        const contentType = this.extractContentType(req);
        const key = `${req.method}-${req.path}-${contentType}`;
        if (!this._middlewareCache[key]) {
            this._middlewareCache[key] = this.buildMiddleware(path, pathSchema, contentType);
        }
        return this._middlewareCache[key](req, res, next);
    }
    extractContentType(req) {
        let contentType = req.headers['content-type'] || 'not_provided';
        let end = contentType.indexOf(';');
        end = end === -1 ? contentType.length : end;
        if (contentType) {
            return contentType.substring(0, end);
        }
        return contentType;
    }
    buildMiddleware(path, pathSchema, contentType) {
        const parameters = this.parametersToSchema(path, pathSchema.parameters);
        let requestBody = pathSchema.requestBody;
        if (requestBody && requestBody.hasOwnProperty('$ref')) {
            const id = requestBody.$ref.replace(/^.+\//i, '');
            requestBody = this._apiDocs.components.requestBodies[id];
        }
        let body = this.requestBodyToSchema(path, contentType, requestBody);
        let requiredAdds = requestBody && requestBody.required ? ['body'] : [];
        const schema = {
            // $schema: "http://json-schema.org/draft-04/schema#",
            required: ['query', 'headers', 'params'].concat(requiredAdds),
            properties: Object.assign({ body }, parameters.schema),
        };
        const validator = this.ajv.compile(schema);
        return (req, res, next) => {
            const shouldUpdatePathParams = Object.keys(req.openapi.pathParams).length > 0;
            if (shouldUpdatePathParams) {
                req.params = req.openapi.pathParams || req.params;
            }
            req.schema = schema;
            /**
             * support json in request params, query, headers and cookies
             * like this filter={"type":"t-shirt","color":"blue"}
             *
             * https://swagger.io/docs/specification/describing-parameters/#schema-vs-content
             */
            parameters.parseJson.forEach(item => {
                if (req[item.reqField] && req[item.reqField][item.name]) {
                    req[item.reqField][item.name] = JSON.parse(req[item.reqField][item.name]);
                }
            });
            /**
             * array deserialization
             * filter=foo,bar,baz
             * filter=foo|bar|baz
             * filter=foo%20bar%20baz
             */
            parameters.parseArray.forEach(item => {
                if (req[item.reqField] && req[item.reqField][item.name]) {
                    req[item.reqField][item.name] = req[item.reqField][item.name].split(item.delimiter);
                }
            });
            /**
             * forcing convert to array if scheme describes param as array + explode
             */
            parameters.parseArrayExplode.forEach(item => {
                if (req[item.reqField] &&
                    req[item.reqField][item.name] &&
                    !(req[item.reqField][item.name] instanceof Array)) {
                    req[item.reqField][item.name] = [req[item.reqField][item.name]];
                }
            });
            const reqToValidate = Object.assign({}, req, { cookies: req.cookies
                    ? Object.assign({}, req.cookies, req.signedCookies) : undefined });
            const valid = validator(reqToValidate);
            // save errors, Ajv overwrites errors on each validation call (race condition?)
            // TODO look into Ajv async errors plugins
            const errors = [...(validator.errors || [])];
            if (valid) {
                next();
            }
            else {
                if (errors.length > 0) {
                    const error = {
                        status: 400,
                        errors: errors.map(e => {
                            const required = e.params &&
                                e.params.missingProperty &&
                                e.dataPath + '.' + e.params.missingProperty;
                            return {
                                path: required || e.dataPath || e.schemaPath,
                                message: e.message,
                                errorCode: `${e.keyword}.openapi.validation`,
                            };
                        }),
                    };
                    const message = this.ajv.errorsText(errors, { dataVar: 'request' });
                    throw ono_1.default(error, message);
                }
            }
        };
    }
    requestBodyToSchema(path, contentType, requestBody = {}) {
        if (requestBody.content) {
            const content = requestBody.content[contentType];
            if (!content) {
                const message = `unsupported media type ${contentType}`;
                const err = errors_1.validationError(415, path, message);
                throw ono_1.default(err, message);
            }
            return content.schema || {};
        }
        return {};
    }
    parametersToSchema(path, parameters = []) {
        const schema = { query: {}, headers: {}, params: {}, cookies: {} };
        const reqFields = {
            query: 'query',
            header: 'headers',
            path: 'params',
            cookie: 'cookies',
        };
        const arrayDelimiter = {
            form: ',',
            spaceDelimited: ' ',
            pipeDelimited: '|',
        };
        const parseJson = [];
        const parseArray = [];
        const parseArrayExplode = [];
        parameters.forEach(parameter => {
            if (parameter.hasOwnProperty('$ref')) {
                const id = parameter.$ref.replace(/^.+\//i, '');
                parameter = this._apiDocs.components.parameters[id];
            }
            const $in = parameter.in;
            const name = $in === 'header' ? parameter.name.toLowerCase() : parameter.name;
            const reqField = reqFields[$in];
            if (!reqField) {
                const message = `Parameter 'in' has incorrect value '${$in}' for [${parameter.name}]`;
                const err = errors_1.validationError(400, path, message);
                throw ono_1.default(err, message);
            }
            let parameterSchema = parameter.schema;
            if (parameter.content && parameter.content[TYPE_JSON]) {
                parameterSchema = parameter.content[TYPE_JSON].schema;
                parseJson.push({ name, reqField });
            }
            if (!parameterSchema) {
                const message = `No available parameter 'schema' or 'content' for [${parameter.name}]`;
                const err = errors_1.validationError(400, path, message);
                throw ono_1.default(err, message);
            }
            if (parameter.schema &&
                parameter.schema.type === 'array' &&
                !parameter.explode) {
                const delimiter = arrayDelimiter[parameter.style];
                if (!delimiter) {
                    const message = `Parameter 'style' has incorrect value '${parameter.style}' for [${parameter.name}]`;
                    const err = errors_1.validationError(400, path, message);
                    throw ono_1.default(err, message);
                }
                parseArray.push({ name, reqField, delimiter });
            }
            if (parameter.schema &&
                parameter.schema.type === 'array' &&
                parameter.explode) {
                parseArrayExplode.push({ name, reqField });
            }
            if (!schema[reqField].properties) {
                schema[reqField] = {
                    type: 'object',
                    properties: {},
                };
            }
            schema[reqField].properties[name] = parameterSchema;
            if (parameter.required) {
                if (!schema[reqField].required) {
                    schema[reqField].required = [];
                }
                schema[reqField].required.push(name);
            }
        });
        return { schema, parseJson, parseArray, parseArrayExplode };
    }
}
exports.RequestValidator = RequestValidator;
//# sourceMappingURL=openapi.request.validator.js.map