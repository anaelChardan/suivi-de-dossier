import { Schema } from 'joi';
import VError from 'verror';

function validatorFactory(schema: Schema, options?: any) {
  return function (body: any): void {
    const values = schema.validate(body, options);

    if (values.error) {
      const error = new VError(
        {
          name: 'INVALID_PAYLOAD',
          info: { errors: values.error.details },
        },
        'Validation payload error',
      );
      throw error;
    }
  };
}

function middlewareFactory(
  target: string,
  schema: Schema,
  options?: any,
): (ctx: any, next: any) => void {
  const validator = validatorFactory(schema, options);
  return async function (ctx: any, next: any): Promise<void> {
    try {
      validator(ctx.request[target]);
    } catch (err) {
      ctx.throw(400, err);
    }
    await next();
  };
}

function paramsValidator(
  schema: Schema,
  options?: any,
): (ctx: any, next: any) => void {
  const validator = validatorFactory(schema, options);
  return async function (ctx: any, next: any): Promise<void> {
    try {
      validator(ctx.params);
    } catch (err) {
      ctx.throw(400, err);
    }
    await next();
  };
}

export const joiValidator = {
  createValidator: validatorFactory,
  paramsValidator,
  bodyValidator: (
    schema: Schema,
    options?: any,
  ): ((ctx: any, next: any) => void) =>
    middlewareFactory('body', schema, options),
  queryValidator: (
    schema: Schema,
    options?: any,
  ): ((ctx: any, next: any) => void) =>
    middlewareFactory('query', schema, options),
};
