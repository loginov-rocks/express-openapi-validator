"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openapi_schema_validator_1 = require("./openapi.schema.validator");
const base_path_1 = require("./base.path");
exports.BasePath = base_path_1.default;
const types_1 = require("./types");
const util_1 = require("./util");
class OpenAPIFramework {
    constructor(args = {}) {
        this.args = args;
        this.name = args.name;
        this.featureType = args.featureType;
        this.loggingPrefix = args.name ? `${this.name}: ` : '';
        this.logger = args.logger ? args.logger : new types_1.ConsoleDebugAdapterLogger();
        const apiDoc = typeof args.apiDoc === 'string'
            ? util_1.handleYaml(util_1.loadSpecFile(args.apiDoc))
            : args.apiDoc;
        this.originalApiDoc = apiDoc;
        if (!this.originalApiDoc) {
            throw new Error(`spec could not be read at ${args.apiDoc}`);
        }
        this.apiDoc = util_1.copy(this.originalApiDoc);
        this.basePaths = this.apiDoc.openapi
            ? util_1.getBasePathsFromServers(this.apiDoc.servers)
            : [
                new base_path_1.default({
                    url: (this.apiDoc.basePath || '').replace(/\/$/, ''),
                }),
            ];
        this.validateApiDoc =
            'validateApiDoc' in args ? !!args.validateApiDoc : true;
        this.validator = new openapi_schema_validator_1.OpenAPISchemaValidator({
            version: this.apiDoc.openapi,
            extensions: this.apiDoc[`x-${this.name}-schema-extension`],
        });
        if (this.validateApiDoc) {
            const apiDocValidation = this.validator.validate(this.apiDoc);
            if (apiDocValidation.errors.length) {
                this.logger.error(`${this.loggingPrefix}Validating schema before populating paths`);
                this.logger.error(`${this.loggingPrefix}validation errors`, JSON.stringify(apiDocValidation.errors, null, '  '));
                throw new Error(`${this.loggingPrefix}args.apiDoc was invalid.  See the output.`);
            }
        }
    }
    initialize(visitor) {
        const getApiDoc = () => {
            return util_1.copy(this.apiDoc);
        };
        util_1.sortApiDocTags(this.apiDoc);
        if (this.validateApiDoc) {
            const apiDocValidation = this.validator.validate(this.apiDoc);
            if (apiDocValidation.errors.length) {
                this.logger.error(`${this.loggingPrefix}Validating schema after populating paths`);
                this.logger.error(`${this.loggingPrefix}validation errors`, JSON.stringify(apiDocValidation.errors, null, '  '));
                throw new Error(`${this.loggingPrefix}args.apiDoc was invalid after populating paths.  See the output.`);
            }
        }
        if (visitor.visitApi) {
            visitor.visitApi({
                basePaths: this.basePaths,
                getApiDoc,
            });
        }
    }
}
exports.default = OpenAPIFramework;
//# sourceMappingURL=index.js.map