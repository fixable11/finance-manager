import { Injectable, Type } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Connection, connection } from 'mongoose';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsRelationshipProvider implements ValidatorConstraintInterface {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    try {
      const result = await (this.connection || connection).models[
        args.constraints[0].name
      ].findById(value);

      return !!result;
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args?: ValidationArguments): string {
    return `${args.property} field must refer to existing ${args.constraints[0].name} document`;
  }
}

export const IsRelationShipWith =
  <TModel extends object>(
    ModelClass: Type<TModel>,
    options?: ValidationOptions,
  ) =>
  (object: object, propertyName: string) =>
    registerDecorator({
      name: `IsRelationShip`,
      target: object.constructor,
      propertyName,
      options,
      constraints: [ModelClass],
      validator: IsRelationshipProvider,
    });
