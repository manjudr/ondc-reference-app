
import Ajv from 'ajv';
import schema from './config.schema.json';
import type { AppConfig } from './types';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
    config?: AppConfig;
}

export const validateConfig = (config: any): ValidationResult => {
    const valid = validate(config);
    if (!valid) {
        return {
            isValid: false,
            errors: validate.errors?.map(err =>
                `${err.instancePath} ${err.message}`
            ) || ['Unknown validation error']
        };
    }
    return {
        isValid: true,
        config: config as AppConfig
    };
};
