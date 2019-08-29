"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationError = (status, path, message, errors) => ({
    status,
    errors: [
        Object.assign({ path,
            message }, ({ errors } || {})),
    ],
});
//# sourceMappingURL=index.js.map