import { Context } from 'koa';
import fs from 'fs';
import path from 'path';
import config from 'config';

export const swagger = async (ctx: Context, next: any): Promise<void> => {
  if (ctx.request.path === '/swagger.json') {
    const swaggerJson = path.resolve(
      __dirname,
      '../../rest',
      'public',
      'swagger.json',
    );

    ctx.set(
      'Access-Control-Allow-Origin',
      config.get('cors.swaggerUi.allowOrigin') as string,
    );

    ctx.body = fs.readFileSync(swaggerJson);
  } else {
    await next();
  }
};
