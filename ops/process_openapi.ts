import fs from 'fs';
import path from 'path';
import { MICROFEED_VERSION } from '../common-src/Version.js';

// Read the OpenAPI YAML file
const yamlPath = path.join(process.cwd(), 'dist', 'openapi.yaml');
let yamlContent = fs.readFileSync(yamlPath, 'utf8');

// Get the base URL from environment or use a default
const baseUrl = process.env.BASE_URL || 'https://api.microfeed.org';

// Replace placeholders
yamlContent = yamlContent
  .replace(/__MICROFEED_VERSION__/g, MICROFEED_VERSION)
  .replace(/__BASE_URL__/g, baseUrl);

// Write the processed file back
fs.writeFileSync(yamlPath, yamlContent);