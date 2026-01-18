# With-NestJs | API

## Getting Started

First, run the development server:

```bash
pnpm run dev
# Also works with NPM, YARN, BUN, ...
```

By default, your server will run at [localhost:3000](http://localhost:3000). You can use your favorite API platform like [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/) to test your APIs

You can start editing the demo **APIs** by modifying [linksService](./src/links/links.service.ts) provider.

## Environment Variables

Create a `.env.local` file in the `apps/api` directory (or `.env` as fallback) with the following variables:

### Required for Basic Functionality

- `DB_HOST` - PostgreSQL database host
- `DB_PORT` - PostgreSQL database port (default: 5432)
- `DB_USERNAME` - PostgreSQL database username
- `DB_PASSWORD` - PostgreSQL database password
- `DB_DATABASE` - PostgreSQL database name
- `CLERK_SECRET_KEY` - Clerk authentication secret key
- `CLERK_PUBLISHABLE_KEY` - Clerk authentication publishable key
- `FRONTEND_URL` - Comma-separated list of allowed frontend URLs for CORS

### Required for Google Calendar Integration

- `GOOGLE_CLIENT_ID` - Google OAuth 2.0 Client ID (from Google Cloud Console)
- `GOOGLE_CLIENT_SECRET` - Google OAuth 2.0 Client Secret (from Google Cloud Console)
- `GOOGLE_OAUTH_REDIRECT_URI` - OAuth callback URL (e.g., `http://localhost:3000/integrations/google-calendar/callback`)
- `FRONTEND_URL` - Frontend application URL for post-OAuth redirect (e.g., `http://localhost:3001`)
- `INTEGRATION_TOKEN_ENCRYPTION_KEY` - 32-byte base64-encoded key for encrypting refresh tokens
  - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
- `JWT_SECRET` - Secret key for signing OAuth state tokens (any secure random string)

### Optional

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (`development` or `production`)

### Important Note 🚧

If you plan to `build` or `test` the app. Please make sure to build the `packages/*` first.

## Learn More

Learn more about `NestJs` with following resources:

- [Official Documentation](https://docs.nestjs.com) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- [Official NestJS Courses](https://courses.nestjs.com) - Learn everything you need to master NestJS and tackle modern backend applications at any scale.
- [GitHub Repo](https://github.com/nestjs/nest)
