export declare const validationError: (status: number, path: string, message: string, errors?: any) => {
    status: number;
    errors: ({
        errors: any;
        path: string;
        message: string;
    } | {
        path: string;
        message: string;
    })[];
};
