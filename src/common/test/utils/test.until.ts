import { ValidationError } from 'class-validator/types/validation/ValidationError';

export function stringified(errors: ValidationError[]): string {
  return JSON.stringify(errors);
}
