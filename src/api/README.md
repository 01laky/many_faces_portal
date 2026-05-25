# API Client

This directory contains the auto-generated API client and types from the backend OpenAPI specification.

## Generation

The API client is generated from the OpenAPI/Swagger specification of the backend API.

To regenerate the API client:

```bash
# First, download the latest OpenAPI spec
curl http://localhost:8000/swagger/v1/swagger.json > openapi.json

# Then generate the client
yarn generate:api
```

## Structure

- `core/` - Core API client functionality (request handling, error handling, etc.)
- `models/` - TypeScript type definitions for API models
- `services/` - Service classes for each API endpoint group
- `config.ts` - Configuration helper for setting up the API client

## Usage

### Basic Setup

The API client is automatically configured in `main.tsx`:

```tsx
import { configureApiClient } from './api/config';
configureApiClient();
```

### Using Services

```tsx
import { AuthService, OAuth2Service } from './api';
import type { RegisterModel, OAuth2TokenRequest } from './api';

// Register a user
const registerData: RegisterModel = {
	email: 'user@example.com',
	password: 'Password123!',
	firstName: 'John',
	lastName: 'Doe',
};

try {
	const result = await AuthService.postApiAuthRegister({
		requestBody: registerData,
	});
	console.log('Registration successful', result);
} catch (error) {
	console.error('Registration failed', error);
}

// Get OAuth2 token
const tokenRequest: OAuth2TokenRequest = {
	grantType: 'password',
	username: 'user@example.com',
	password: 'Password123!',
	clientId: 'be-demo-client',
	clientSecret: 'be-demo-secret-very-strong-key',
};

try {
	const tokenResponse = await OAuth2Service.postApiOauth2Token({
		requestBody: tokenRequest,
	});
	console.log('Token received', tokenResponse);
} catch (error) {
	console.error('Token request failed', error);
}
```

### Authentication

To set an authentication token for subsequent requests:

```tsx
import { setAuthToken } from './api/config';

// Set token after login
setAuthToken('your-jwt-token-here');

// Clear token on logout
setAuthToken(null);
```

### Environment Variables

The API base URL is configured from environment variables:

- `VITE_API_URL` - Base URL for API requests (default: http://localhost:8000)

Set this in your `.env` file:

```
VITE_API_URL=http://localhost:8000
```

## Available Services

- `AuthService` - Authentication endpoints (register, login, logout)
- `OAuth2Service` - OAuth2 endpoints (token, register)

## Available Models

- `RegisterModel` - User registration data
- `LoginModel` - User login data
- `OAuth2TokenRequest` - OAuth2 token request
- `OAuth2RegisterModel` - OAuth2 user registration

## Error Handling

All API calls return `CancelablePromise` which can throw `ApiError`:

```tsx
import { ApiError } from './api';

try {
	await AuthService.postApiAuthRegister({ requestBody: data });
} catch (error) {
	if (error instanceof ApiError) {
		console.error('API Error:', error.status, error.body);
	} else {
		console.error('Unknown error:', error);
	}
}
```
