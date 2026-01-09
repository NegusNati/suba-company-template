# Contributing to Suba Company Template

First off, thank you for considering contributing to this project! It's people like you that make this template a great starting point for company websites.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How Can I Contribute?](#how-can-i-contribute)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/suba-company-template.git`
3. Add the upstream remote: `git remote add upstream https://github.com/ORIGINAL_OWNER/suba-company-template.git`
4. Create a branch for your changes: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) >= 1.3.0
- [Docker](https://www.docker.com/) (for PostgreSQL)
- Node.js >= 20 (optional, Bun handles most things)

### Installation

```bash
# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Start the database
bun db:start

# Push the schema to the database
bun db:push

# (Optional) Seed the database with sample data
bun db:seed

# Start the development servers
bun dev
```

### Useful Commands

```bash
# Run linting
bun lint

# Fix lint issues
bun lint:fix

# Format code
bun format

# Check formatting
bun format:check

# Type check
bun check-types

# Run tests
bun test:server
```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, Bun version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed enhancement**
- **Explain why this enhancement would be useful**
- **Include mockups or examples if applicable**

### Code Contributions

1. **Pick an issue** - Look for issues labeled `good first issue` or `help wanted`
2. **Comment on the issue** - Let others know you're working on it
3. **Follow the coding standards** - See [Style Guidelines](#style-guidelines)
4. **Write tests** - If applicable, add tests for your changes
5. **Submit a PR** - See [Pull Request Process](#pull-request-process)

## Style Guidelines

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use explicit types for function parameters and return values
- Use `type` for object shapes, `interface` for extendable contracts

### React

- Use functional components with hooks
- Prefer composition over inheritance
- Use the template config (`apps/web/src/config/template.ts`) for customizable values
- Follow the feature-based folder structure

### Backend

- Follow the modular architecture (controller, service, repository, validators)
- Use Zod for validation
- Return consistent response formats using helpers in `core/http.ts`

### General

- Use meaningful variable and function names
- Keep functions small and focused
- Document complex logic with comments
- Run `bun format` before committing

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(auth): add Google OAuth support
fix(api): handle empty response in blogs endpoint
docs: update README with deployment instructions
refactor(dashboard): extract table component
```

## Pull Request Process

1. **Update documentation** - If your changes affect usage, update the relevant docs
2. **Run quality checks** - Ensure `bun lint`, `bun format:check`, and `bun check-types` pass
3. **Write a clear description** - Explain what your PR does and why
4. **Link related issues** - Use "Fixes #123" or "Relates to #123"
5. **Request review** - Tag relevant maintainers for review
6. **Address feedback** - Respond to review comments promptly

### PR Checklist

- [ ] I have read the [CONTRIBUTING.md](CONTRIBUTING.md) document
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] All new and existing tests pass locally

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing.

Thank you for your contribution!
