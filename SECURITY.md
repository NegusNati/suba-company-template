# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to the maintainers. You can find contact information in the SUPPORT.md file.

When reporting a vulnerability, please include:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** of the vulnerability
4. **Suggested fix** (if you have one)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
- **Communication**: We will keep you informed of our progress in addressing the vulnerability.
- **Resolution**: We aim to resolve critical vulnerabilities within 7 days.
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous).

## Security Best Practices

When deploying this template, ensure you:

1. **Environment Variables**
   - Never commit `.env` files with real credentials
   - Use strong, unique values for `BETTER_AUTH_SECRET`
   - Rotate credentials regularly

2. **Database**
   - Use strong database passwords
   - Enable SSL for database connections in production
   - Regularly backup your database

3. **Authentication**
   - Enable rate limiting on auth endpoints
   - Use HTTPS in production
   - Configure CORS appropriately

4. **Dependencies**
   - Regularly update dependencies
   - Use `bun audit` to check for vulnerabilities
   - Pin dependency versions for reproducible builds

## Security Features

This template includes:

- **Better Auth** for secure authentication
- **Rate limiting** middleware
- **Input validation** with Zod
- **SQL injection protection** via Drizzle ORM
- **XSS protection** headers

Thank you for helping keep this project and its users safe!
