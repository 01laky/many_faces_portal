# Fe Demo - Frontend Application

React + TypeScript + Vite frontend application for the BeDemo project.

## Overview

The Frontend (fe_demo) is a modern React application built with TypeScript and Vite. It provides a user-friendly interface for interacting with the BeDemo API, including user registration, login, and protected content management.

## Features

- **Modern React Stack**
  - React 18 with TypeScript
  - Vite for fast development and building
  - React Router for navigation
  - React Query for API data management

- **User Authentication**
  - User registration and login
  - Protected routes
  - JWT token management
  - OAuth2 flow support

- **Internationalization (i18n)**
  - Multi-language support (English, Slovak, Czech)
  - Language switching in UI
  - Localized routes

- **UI Components**
  - Custom Radix-based components (Button, Input, FormField)
  - Bootstrap styling
  - Toast notifications
  - Responsive design

- **API Integration**
  - Auto-generated API client from Swagger/OpenAPI
  - Type-safe API calls
  - Error handling and retry logic

- **Face Path Routing (Multi-Tenant Support)**
  - Automatic face prefix extraction from URL (e.g., `/acme-corp/dashboard`)
  - URL transformation: `/api/users` → `/api/acme-corp/users`
  - Language prefix handling: correctly identifies `/en/login` vs `/acme-corp/en/login`
  - Axios interceptors for automatic face path injection
  - Comprehensive test coverage (26 tests)

## Technologies

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **Bootstrap** - CSS framework
- **Yarn** - Package manager (PnP mode)
- **Vitest** - Unit testing framework

## Project Structure

```
fe_demo/
├── src/
│   ├── api/                # Auto-generated API client
│   │   ├── services/       # API service classes
│   │   ├── models/         # TypeScript models
│   │   ├── core/           # API core utilities
│   │   ├── config.ts       # API client configuration with face path routing
│   │   ├── ApiClient.ts    # API client wrapper
│   │   └── __tests__/      # API tests (face path routing)
│   ├── components/         # React components
│   │   ├── radix/          # Custom UI components
│   │   └── ...             # Other components
│   ├── pages/              # Page components
│   ├── contexts/           # React contexts (Auth, App)
│   ├── hooks/              # Custom React hooks
│   ├── i18n/               # Internationalization
│   ├── styles/             # Global styles
│   ├── utils/              # Utility functions
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile.dev          # Development Dockerfile
├── Dockerfile              # Production Dockerfile
├── start-dev.sh            # Start development script
├── stop-dev.sh             # Stop development script
├── clear-dev.sh            # Clear containers script
├── rebuild-dev.sh          # Rebuild Docker images script
└── README.md               # This file
```

## Running

### Running in Docker Container (Recommended)

The easiest way to run the frontend in development:

```bash
./start-dev.sh
```

This script will:

1. Check and install dependencies if needed
2. Run code validation (TypeScript, ESLint)
3. Format code with Prettier
4. Run unit tests
5. Start the Vite dev server in Docker
6. Make the app available at `http://localhost:8081`

**Note**: The script runs tests before starting. If tests fail, the startup is stopped.

### Manual Docker Compose

```bash
docker-compose -f docker-compose.yml up --build
```

### Stopping Services

```bash
./stop-dev.sh
```

Or manually:

```bash
docker-compose -f docker-compose.yml down
```

### Clearing Everything

```bash
./clear-dev.sh
```

This removes containers, volumes, and images.

### Rebuilding Docker Images

To perform a clean rebuild of Docker images:

```bash
./rebuild-dev.sh
```

**Note**: This only builds images, it does NOT start containers. Use `./start-dev.sh` to start containers after rebuilding.

### Local Development (Without Docker)

1. **Install dependencies**:

   ```bash
   yarn install
   ```

2. **Start development server**:

   ```bash
   yarn dev
   ```

   The app will be available at `http://localhost:8081`

3. **Run tests**:

   ```bash
   yarn test
   ```

4. **Format code**:

   ```bash
   yarn format
   ```

5. **Build for production**:
   ```bash
   yarn build
   ```

## Configuration

### Environment Variables

The frontend uses environment variables (configured in `docker-compose.yml` or `.env`):

- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)
- `VITE_API_HTTPS_URL` - Backend API HTTPS URL (default: `https://localhost:8001`)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_PORT` - Dev server port (default: `8081`)

### API Configuration

The API client is auto-generated from the backend Swagger/OpenAPI specification. To regenerate:

```bash
yarn generate:api
```

This updates the API client in `src/api/` based on the backend API schema.

## Pages

- **Home** (`/`) - Landing page with login/register links
- **Login** (`/login`) - User login page
- **Register** (`/register`) - User registration page
- **Protected Home** (`/:locale/home`) - Protected page after login

All pages support internationalization with localized routes:

- `/en/login` - English
- `/sk/login` - Slovak
- `/cz/login` - Czech

## Components

### Custom Components

- **Button** - Styled button component
- **Input** - Text input component
- **FormField** - Form field with label and validation
- **Header** - Application header with navigation
- **LanguageSwitcher** - Language selection dropdown
- **ProtectedRoute** - Route guard for authenticated users
- **GuestRoute** - Route guard for unauthenticated users

### API Integration

API client is generated from Swagger and provides type-safe methods:

```typescript
import { AuthService } from '@/api';

// Register
const result = await AuthService.register({
  email: 'user@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
});

// Login
const loginResult = await AuthService.login({
  email: 'user@example.com',
  password: 'password123',
});
```

## Face Path Routing (Multi-Tenant Support)

The frontend implements automatic face path routing for multi-tenant support. This allows the application to automatically scope API requests to specific tenants based on the URL path.

### How It Works

When the application makes API requests, the axios interceptor (configured in `src/api/config.ts`) automatically:

1. **Extracts face path** from `window.location.pathname` (e.g., `/acme-corp/dashboard` → `acme-corp`)
2. **Handles language prefixes** correctly (e.g., `/en/login` → no face path, `/acme-corp/en/login` → `acme-corp`)
3. **Transforms API URLs** from `/api/users` to `/api/acme-corp/users`
4. **Adds face path** to all API requests automatically

### URL Examples

```
# Language-only route (no face path)
/en/login → API requests: /api/users (no face path added)

# Face-prefixed route
/acme-corp/dashboard → API requests: /api/acme-corp/users

# Face + language route
/acme-corp/en/login → API requests: /api/acme-corp/users
```

### Implementation Details

The face path routing is implemented via:

- **Axios Interceptors**: Global request interceptor in `src/api/config.ts`
- **Face Path Extraction**: Logic to identify face prefix vs language prefix
- **URL Transformation**: Automatic insertion of face path after `/api/` prefix
- **Language Support**: Correctly handles i18n routes with language prefixes

### Configuration

Face path routing is automatically configured when `configureApiClient()` is called in `main.tsx`:

```typescript
import { configureApiClient } from './api/config';

configureApiClient(); // Sets up face path routing automatically
```

### Testing

Face path routing has comprehensive test coverage (26 tests) in `src/api/__tests__/facePathRouting.test.ts`:

- Face path extraction from various URL formats
- URL transformation logic
- Language prefix handling
- Edge cases and error scenarios

Run tests:

```bash
yarn test
```

## Development Workflow

1. **Start backend**: Ensure backend API is running (via `be_demo` or root `start-all-dev.sh`)

2. **Start frontend**: Run `./start-dev.sh` or use root `start-all-dev.sh` to start all services

3. **Make code changes**: Edit code in `src/`

4. **Test changes**:
   - Unit tests: `yarn test`
   - Manual testing: Open `http://localhost:8081`

5. **View logs**: Check Docker logs or browser console

6. **Stop services**: Run `./stop-dev.sh` or root `stop-all-dev.sh`

## Testing

### Run Tests

```bash
yarn test
```

### Run Tests in Watch Mode

```bash
yarn test:watch
```

### Run Tests with Coverage

```bash
yarn test:coverage
```

Tests are located in:

- `src/utils/__tests__/` - Utility function tests (route translations)
- `src/api/__tests__/` - API client tests (face path routing)
- Component tests (when added)

## Code Quality

### Linting

```bash
yarn lint
```

### Formatting

```bash
yarn format
```

### Type Checking

```bash
yarn type-check
```

## Build

### Development Build

```bash
yarn build
```

### Production Build

```bash
yarn build
```

Output will be in `dist/` directory, ready for deployment.

## Integration with Root Project

This frontend is part of the `_mfai_demo` monorepo and integrates with:

- **Backend API**: `be_demo` (ASP.NET Core)
- **Database**: `db_demo` (PostgreSQL) - via backend
- **Redis**: `redis_demo` - job queue via backend
- **Admin**: `admin_demo` (separate admin panel)

Use root-level scripts to manage all services:

- `start-all-dev.sh` - Start all services with live status screen
- `stop-all-dev.sh` - Stop all services
- `clear-all-dev.sh` - Clear all containers and volumes
- `status-all.sh` - Show status of all services
- `rebuild-all-dev.sh` - Rebuild all Docker images

## Troubleshooting

### Dependencies Not Installing

If Yarn PnP (Plug'n'Play) is causing issues:

```bash
# Check Yarn version
yarn --version

# Clear cache
yarn cache clean

# Reinstall
rm -rf .yarn/cache
yarn install
```

See `YARN_PNP.md` for more information.

### Port Already Allocated

If port 8081 is already in use:

```bash
# Find process using port
lsof -ti:8081

# Kill process
lsof -ti:8081 | xargs kill -9

# Or use clear script
./clear-dev.sh
```

### API Connection Failed

- Ensure backend API is running: `docker ps | grep be-demo-dev`
- Check API URL in environment variables
- Verify CORS is enabled on backend
- Check browser console for errors

### TypeScript Errors

- Ensure all dependencies are installed: `yarn install`
- Check TypeScript version: `yarn tsc --version`
- Try regenerating types: `yarn generate:api`

## Additional Documentation

- **Docker**: See `DOCKER.md` for Docker-specific documentation
- **Editor Setup**: See `SETUP_EDITOR.md` for IDE configuration
- **Yarn PnP**: See `YARN_PNP.md` for Yarn Plug'n'Play information
- **API Client**: See `src/api/README.md` for API client documentation
- **i18n**: See `src/i18n/README.md` for internationalization setup
