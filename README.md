# Many Faces AI (MFAI) - frontend application

## Overview

The MFAI frontend is the user-facing React application for the Many Faces AI demo. It is responsible for rendering configurable face pages, localized navigation, authenticated social experiences, dynamic page grids, media-rich content blocks, profiles, chats, stories, albums, blogs, reels, wall listings, and role-aware user flows on top of the backend API.

The application is built around the concept of **faces**: configurable community spaces with their own route prefix, visual context, page structure, available modules, content, and access rules. A face can represent a public community, private group, branded space, or specialized social environment. The frontend resolves the active face from the URL and shared face configuration, then uses that context to load the correct page layout, scope API requests, render the right components, and expose only the actions available to the current user.

At the UI level, the app combines an admin-managed grid system with reusable social building blocks. Pages are not treated as one-off hardcoded screens: the backend can provide layout schemas, and the frontend turns those schemas into responsive blocks such as albums, blogs, reels, chat rooms, story rings, profile cards, wall ticket listings, and other social modules. This makes the frontend suitable for experimenting with different community experiences without rewriting the whole page structure each time.

The frontend also acts as the main interaction layer for authenticated users. It handles login and registration flows, protected routes, JWT-backed API calls, selected face context, localized route handling, content creation entry points, responsive navigation, and user-facing feedback such as loading states, empty states, and disabled unavailable actions. It is designed to keep the user experience clear even when a face has different permissions, modules, or available content than another one.

Security and trust boundaries are visible in the frontend design. Authentication state, protected route guards, role-aware controls, capability-aware actions, face-aware data loading, and explicit unsupported states help users understand what they can and cannot do in the current context. Enforcement remains the responsibility of the backend, but the frontend mirrors those rules intentionally so sensitive or unavailable actions are not presented as normal user options.

From an engineering perspective, this submodule is also a playground for a modern React architecture: generated OpenAPI clients, TypeScript models, React contexts, TanStack Query data loading, i18n route support, reusable component blocks, responsive grid rendering, Docker-based local development, linting, type checks, unit tests, and Cypress smoke coverage are all part of the application. The goal is to keep the frontend understandable, testable, and easy to extend as new face modules and social workflows are added.

## What This Frontend Shows

- Face-aware routing based on URL prefixes and shared face configuration.
- Dynamic page grids rendered from backend-managed layout schemas.
- Reusable grid blocks for social content, media, messaging, profiles, and listings.
- User-facing modules for albums, blogs, reels, stories, wall tickets, chat rooms, profiles, follows, blocks, comments, likes, and notifications.
- Authenticated and unauthenticated flows with protected routes and JWT-backed API calls.
- Role/capability-aware UI behaviour for create flows, admin-dependent actions, and unavailable features.
- Localized routes and UI strings for English, Slovak, and Czech.
- Responsive rendering for grid layouts, cards, carousels, pagination, and mobile-friendly views.
- Generated OpenAPI API client with typed services and models.
- React contexts for auth, face configuration, grid top panel state, and shared application state.
- Neutral local placeholders and explicit empty states instead of relying on external placeholder services.
- Submitted-for-approval feedback for user-created albums, blogs, and reels, plus a **My submissions** hub (`/my-submissions`) backed by `GET /api/my/content-submissions`, so users see queue state, safe reasons, and deep links to detail with optional `?edit=1` when edits are allowed.
- Docker-first local development that works both standalone and through the root monorepo scripts.
- Validation through ESLint, TypeScript checks, Vitest tests, and Cypress smoke coverage.

## User Content Approval UX

Albums, blogs, and reels created from the user-facing frontend follow the moderation workflow in [`docs/guides/ai-assisted-content-approval.md`](../docs/guides/ai-assisted-content-approval.md). Create flows use the existing OpenAPI services, read backend-owned `approvalStatus` / `aiReviewStatus` fields, and show **submitted-for-approval** copy after a successful create.

**My submissions** loads the unified moderation list, groups rows by pipeline state (pending, AI in progress, needs human review, terminal outcomes), and links to `/album/{id}`, `/blog/{id}`, or `/reel/{id}` (with `faceId` for reels when needed). **`?edit=1`** opens the editor when the backend allows owner edits (typically **pending** or **rejected**). Edit and delete controls on album/blog/reel detail pages are gated the same way.

Public grid/list/detail views stay **`Approved`-only** for other users; the UI never presents internal AI diagnostics (raw model reasons, trace IDs, flag dumps). Helpers in `src/utils/contentModeration.ts` map statuses to safe labels, trim creator-safe reasons, and back moderation badges — covered by Vitest.

```mermaid
flowchart LR
    create["Create album blog reel"] --> pending["PendingApproval response"]
    pending --> copy["Success copy not public"]
    pending --> my["My submissions page"]
    my --> detail["Detail + optional ?edit=1"]
    detail --> api["Owner-gated PUT DELETE"]
```

## Route And Grid Rendering

The frontend turns a face URL and backend-managed page schema into a responsive grid of reusable social components:

```mermaid
flowchart TD
    url["Browser URL<br/>/:facePath/:locale/..."] --> router["React Router<br/>localized route elements"]
    router --> guards["GuestRoute / ProtectedRoute"]
    guards --> face["FaceConfigContext<br/>selectedFace + available faces"]

    face --> api["Typed OpenAPI client<br/>face-aware API requests"]
    api --> backend["Backend API<br/>page + grid schema"]
    backend --> schema["gridSchema JSON<br/>items, breakpoints, cols, rowHeight"]

    schema --> layout["PageGridLayout<br/>parse schema + build responsive layouts"]
    layout --> block["ComponentBlock<br/>shared header, actions, footer, panels"]
    block --> components["Grid components<br/>Album, Blog, Reel, Story, ChatRoom,<br/>UserProfile, Ad + grid/carousel variants"]

    face --> block
    block --> actions["Role/capability-aware actions<br/>create, list, sort/filter, settings"]
```

## Component Interaction Flow

Grid blocks use the same wrapper and route contract, so list/detail/create behaviour stays consistent across content modules:

```mermaid
flowchart LR
    block["ComponentBlock"] --> render["Render child component<br/>single, grid, or carousel"]

    block --> listBtn["List action"]
    listBtn --> listRoute["/list/:componentTypeId"]
    listRoute --> listPage["ComponentListPage"]

    render --> itemClick["User opens an item"]
    itemClick --> detailRoute["/detail/:componentTypeId/:entityId<br/>or module detail route"]
    detailRoute --> detailPage["ComponentDetailPage<br/>AlbumDetailPage / BlogDetailPage / ReelDetailPage"]

    block --> createBtn["Create action"]
    createBtn --> capabilities{"Allowed for this<br/>face and component?"}
    capabilities -->|yes| topPanel["GridTopPanelContext<br/>openGridCreate"]
    topPanel --> createBody["GridTopPanelContent"]
    createBody --> forms["AlbumForm / BlogForm / ReelForm / ChatRoomForm"]
    forms --> api["Typed API service"]
    api --> refresh["Saved content reloads<br/>or navigates to detail"]

    capabilities -->|no| disabled["Disabled action<br/>localized unavailable message"]
```

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

- **Face Path Routing**
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
many_faces_portal/
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

## Face Path Routing

The frontend implements automatic face path routing. This allows the application to scope API requests to the active face based on the URL path.

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

1. **Start backend**: Ensure backend API is running (via **many_faces_backend** / `many_faces_backend/` or monorepo `./scripts/start-all-dev.sh`)

2. **Start frontend**: Run `./start-dev.sh` or use monorepo `./scripts/start-all-dev.sh` to start all services

3. **Make code changes**: Edit code in `src/`

4. **Test changes**:
   - Unit tests: `yarn test`
   - Manual testing: Open `http://localhost:8081`

5. **View logs**: Check Docker logs or browser console

6. **Stop services**: Run `./stop-dev.sh` or monorepo `./scripts/stop-all-dev.sh`

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

### Cypress (E2E)

After a production build, `vite preview` serves **HTTP** on port **4173** (see `vite.config.ts` `preview`) so Cypress does not need dev certificates.

```bash
yarn build
yarn preview --host 127.0.0.1 --port 4173 --strictPort   # background terminal
yarn test:e2e:ci                                       # app shell smoke
# Optional — requires API at E2E_API_URL (default http://127.0.0.1:8000):
yarn test:e2e:api
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

### eslint-plugin-react-hooks (ESLint 10 peers)

Stable `eslint-plugin-react-hooks@latest` did not yet list ESLint **10** in `peerDependencies`, which caused Yarn **`YN0060`** / **`YN0086`** with ESLint 10 in this workspace. The project therefore pins an **exact** canary version whose peers include **`^10.0.0`** (see [facebook/react#35758](https://github.com/facebook/react/issues/35758)). **Removal trigger:** when `npm view eslint-plugin-react-hooks@latest peerDependencies` includes `^10.0.0` for `eslint`, switch `package.json` to that stable release and re-run `yarn install --immutable` plus `yarn validate` / `yarn test` / `yarn build`. **Automation:** bumps are **manual** here (no Dependabot ignore list ships in-repo). Full notes: [docs/eslint-plugin-react-hooks-peer.md](./docs/eslint-plugin-react-hooks-peer.md).

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

This frontend is part of the **`many_faces_main`** monorepo (`many_faces_portal/` submodule on GitHub: `many_faces_portal`) and integrates with:

- **Backend API**: **many_faces_backend** (`many_faces_backend/`, ASP.NET Core)
- **Database**: **many_faces_database** (`many_faces_database/`, PostgreSQL) — via backend
- **Redis**: **many_faces_redis** (`many_faces_redis/`) — job queue via backend
- **Admin**: **many_faces_admin** (`many_faces_admin/`, separate admin panel)

Use root-level scripts to manage all services:

- `./scripts/start-all-dev.sh` - Start all services with live status screen
- `./scripts/stop-all-dev.sh` - Stop all services
- `./scripts/clear-all-dev.sh` - Clear all containers and volumes
- `./scripts/status-all.sh` - Show status of all services
- `./scripts/rebuild-all-dev.sh` - Rebuild all Docker images

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
