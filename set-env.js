const fs = require('fs');
require('dotenv').config();

const envFile = `
export const environment = {
  production: false,
  cloudinary: {
    cloudName: '${process.env.CLOUDINARY_CLOUD_NAME}',
    apiKey: '${process.env.CLOUDINARY_API_KEY}'
  }
};
`;

fs.writeFileSync('./src/environments/environment.ts', envFile);
