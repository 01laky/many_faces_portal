import type { Config } from 'openapi-typescript-codegen';

const config: Config = {
	input: 'http://localhost:8000/swagger/v1/swagger.json',
	output: './src/api',
	httpClient: 'axios',
	clientName: 'ApiClient',
	useOptions: true,
	useUnionTypes: true,
	exportCore: true,
	exportServices: true,
	exportModels: true,
	exportSchemas: false,
};

export default config;
