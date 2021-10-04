import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';

import { name, version, description } from '../package.json';

const swaggerDefinition = {
  openapi: '3.0.0', // Specification (optional, defaults to swagger: '2.0')
  info: {
    // API informations (required)
    title: name, // Title (required)
    version: version, // Version (required)
    description: description, // Description (optional)
  },
  basePath: '/', // Base path (optional)
};

const options = {
  swaggerDefinition,
  apis: ['**/src/presentation/rest/**/*.{ts,js}'],
};

const swaggerSpec = swaggerJSDoc(options);

if (!fs.existsSync(path.resolve(__dirname, './presentation/rest/public'))) {
  fs.mkdirSync(path.resolve(__dirname, './presentation/rest/public'));
}

fs.writeFileSync(
  path.resolve(__dirname, './presentation/rest/public', 'swagger.json'),
  JSON.stringify(swaggerSpec),
);

console.info('swagger.json file generated!');
