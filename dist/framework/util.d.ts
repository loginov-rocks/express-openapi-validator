import { OpenAPIV3 } from './types';
import BasePath from './base.path';
export declare function assertRegExpAndSecurity(framework: any, tuple: any): void;
export declare function copy(obj: any): any;
export declare function loadSpecFile(filePath: any): any;
export declare function handleYaml(apiDoc: any): any;
export declare function sortApiDocTags(apiDoc: any): void;
export declare function getBasePathsFromServers(servers: OpenAPIV3.ServerObject[]): BasePath[];
