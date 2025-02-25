import * as _ from 'lodash';
import { Application, Request, Response, NextFunction } from 'express';
import { OpenApiContext } from './openapi.context';
import * as middlewares from './middlewares';
import ono from 'ono';
import { OpenAPIV3, OpenApiRequest } from './framework/types';

export interface OpenApiValidatorOpts {
  apiSpecPath?: string;
  apiSpec?: OpenAPIV3.Document | string;
  ignore?: (req: Request) => boolean;
  multerOpts?: {};
}

export class OpenApiValidator {
  private context: OpenApiContext;
  private ignore?: (req: Request) => boolean;
  private multerOpts: {};

  constructor(options: OpenApiValidatorOpts) {
    if (!options.apiSpecPath && !options.apiSpec)
      throw ono('apiSpecPath or apiSpec required');
    if (options.apiSpecPath && options.apiSpec)
      throw ono('apiSpecPath or apiSpec required. not both.');

    this.ignore = options.ignore;
    this.multerOpts = options.multerOpts;

    const openApiContext = new OpenApiContext({
      apiDoc: options.apiSpecPath || options.apiSpec,
    });

    this.context = openApiContext;
  }

  install(app: Application) {
    const pathParams = [];
    for (const route of this.context.routes) {
      if (route.pathParams.length > 0) {
        pathParams.push(...route.pathParams);
      }
    }

    // install param on routes with paths
    for (const p of _.uniq(pathParams)) {
      app.param(p, (req: OpenApiRequest, res, next, value, name) => {
        if (req.openapi.pathParams) {
          // override path params
          req.params[name] = req.openapi.pathParams[name] || req.params[name];
        }
        next();
      });
    }

    const aoav = new middlewares.RequestValidator(this.context.apiDoc, {
      coerceTypes: true,
      removeAdditional: false,
      useDefaults: true,
    });

    const validateMiddleware = (req, res, next) => {
      return aoav.validate(req, res, next, this.ignore);
    };

    app.use(
      middlewares.applyOpenApiMetadata(this.context),
      middlewares.multipart(this.context, this.multerOpts),
      validateMiddleware,
    );
  }
}
