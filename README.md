# Company Website Template

A production-ready, full-stack company website template built with modern TypeScript technologies. Includes a complete CMS dashboard, blog system, careers portal, case studies, and more.

## Features

### Frontend

- **React 19** with TanStack Router for type-safe file-based routing
- **TailwindCSS** + **shadcn/ui** for beautiful, accessible UI components
- **Framer Motion** for smooth animations
- **React Query** for server state management
- **Lexical** rich text editor for content creation

### Backend

- **Hono** - Fast, lightweight server framework
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Reliable database engine
- **Better Auth** - Flexible authentication (email/password + OAuth)
- **Modular architecture** - Easy to extend and maintain

### Content Management

- Full CMS dashboard for managing all content
- Blog system with rich text, tags, and SEO metadata
- Services and case studies showcase
- Careers portal with job listings
- Contact form with message management
- Partners and testimonials management
- Gallery and media management

### Developer Experience

- **TypeScript** throughout the entire stack
- **Turborepo** for optimized monorepo builds
- **Bun** as the runtime and package manager
- **ESLint** + **Prettier** for consistent code style
- **Husky** for git hooks

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- [Docker](https://www.docker.com/) (for PostgreSQL) or a PostgreSQL instance

### Automated Setup (Recommended)

The easiest way to get started is with the automated setup script:

```bash
# Clone the repository
git clone https://github.com/your-org/suba-company-template.git
cd suba-company-template

# Run the setup script
bun setup
```

The `bun setup` script will automatically:

1. Check that prerequisites are installed (Bun, Docker)
2. Install all workspace dependencies
3. Create `.env` from `.env.example` at the project root
4. Start PostgreSQL database via Docker Compose
5. Push the database schema using Drizzle ORM
6. Seed the database with sample content

Once setup completes, start the development servers:

```bash
bun dev
```

The web app runs on `http://localhost:5173` and the API on `http://localhost:3000`.

### Manual Setup

If you prefer to set things up manually or need more control:

```bash
# Clone the repository
git clone https://github.com/your-org/suba-company-template.git
cd suba-company-template

# Install dependencies
bun install

# Set up environment variables (single .env at root)
cp .env.example .env
# Edit .env with your configuration

# Start the database (if using Docker)
bun db:start

# Push the schema to the database
bun db:push

# (Optional) Seed with sample data
bun db:seed

# Start development servers
bun dev
```

## Project Structure

```
suba-company-template/
├── apps/
│   ├── web/              # React frontend
│   │   ├── src/
│   │   │   ├── routes/   # File-based routes
│   │   │   ├── features/ # Feature components
│   │   │   ├── components/ # Shared UI components
│   │   │   ├── lib/      # API clients and utilities
│   │   │   └── config/   # Template configuration
│   │   └── public/       # Static assets
│   └── server/           # Hono API server
│       ├── src/
│       │   ├── modules/  # Feature modules (blogs, services, etc.)
│       │   ├── core/     # HTTP infrastructure
│       │   └── shared/   # Cross-cutting utilities
│       └── scripts/      # CLI tools
├── packages/
│   ├── db/               # Database schema and migrations
│   ├── auth/             # Authentication configuration
│   └── types/            # Shared TypeScript types
└── docs/                 # Documentation
```

## Configuration

### Template Branding

Customize the template by editing `apps/web/src/config/template.ts`:

```typescript
export const COMPANY = {
  name: "Your Company",
  tagline: "Your Tagline",
  email: "contact@yourcompany.com",
  // ...
};
```

### Environment Variables

All environment variables are configured in a single `.env` file at the project root. See `.env.example` for all available options:

| Variable               | Description                           |
| ---------------------- | ------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string          |
| `BETTER_AUTH_SECRET`   | Authentication secret (min 32 chars)  |
| `BETTER_AUTH_URL`      | API server URL for auth callbacks     |
| `CORS_ORIGIN`          | Comma-separated allowed origins       |
| `VITE_SERVER_URL`      | API URL for frontend requests         |
| `VITE_SITE_URL`        | Frontend URL for SEO/OG tags          |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID (optional)     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |

The server, auth package, and database all load from this single root `.env` file.

## Available Scripts

| Command           | Description                           |
| ----------------- | ------------------------------------- |
| `bun setup`       | Automated project setup (recommended) |
| `bun dev`         | Start all apps in development mode    |
| `bun build`       | Build all apps for production         |
| `bun lint`        | Run ESLint                            |
| `bun format`      | Format code with Prettier             |
| `bun check-types` | TypeScript type checking              |
| `bun db:push`     | Push schema changes to database       |
| `bun db:studio`   | Open Drizzle Studio                   |
| `bun db:seed`     | Seed database with sample data        |
| `bun db:start`    | Start Docker PostgreSQL               |
| `bun db:stop`     | Stop Docker PostgreSQL                |

## Adding New Backend Modules

Use the module generator:

```bash
cd apps/server
bun run scripts/new-module.ts your-module-name
```

This creates a complete module with:

- Repository (data access)
- Service (business logic)
- Controller (HTTP handlers)
- Routes (endpoint definitions)
- Validators (Zod schemas)

## Routes Overview

| Route                 | Description               |
| --------------------- | ------------------------- |
| `/`                   | OSS template landing page |
| `/demo/*`             | Marketing site demo       |
| `/dashboard/*`        | CMS admin dashboard       |
| `/login`, `/register` | Authentication            |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Security

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Credits

Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack) and inspired by modern full-stack TypeScript best practices.
