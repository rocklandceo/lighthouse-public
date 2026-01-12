# Contributing to Lighthouse SEO Dashboard

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Contribution Requirements

### Developer Certificate of Origin (DCO)

All commits must be signed off with the Developer Certificate of Origin (DCO). This certifies that you have the right to submit your contribution under the project's license.

**How to sign off commits:**

```bash
git commit -s -m "Your commit message"
```

The `-s` flag adds a `Signed-off-by` line to your commit message:

```
Signed-off-by: Your Name <your.email@example.com>
```

**What the DCO means:**

By signing off your commits, you certify that:

1. The contribution was created in whole or in part by you and you have the right to submit it under the Apache 2.0 license.
2. The contribution is based upon previous work that, to the best of your knowledge, is covered under an appropriate open source license and you have the right to submit that work with modifications.
3. The contribution was provided directly to you by some other person who certified (1) or (2) and you have not modified it.
4. You understand and agree that this project and the contribution are public and that a record of the contribution is maintained indefinitely.

Full DCO text: https://developercertificate.org/

### Contributor License Agreement (CLA)

All contributions to this project require agreement to the Contributor License Agreement (CLA). Please review [CLA.md](CLA.md) before submitting your first contribution.

**By submitting a Pull Request, you agree to the CLA terms:**

- You grant the project owner (Oliver Marler) a license to use, modify, sublicense, and relicense your contribution
- You retain copyright to your contribution
- The project owner may offer the project under additional or alternative licenses, including commercial licenses
- You confirm you have the legal right to make the contribution

Your Pull Request submission constitutes acceptance of these terms.

## Development Setup

### Prerequisites

- Node.js 18+ (20 recommended)
- npm or pnpm
- A Vercel account (for KV storage)
- Google Cloud credentials (for OAuth)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/lighthouse-seo-dashboard.git
   cd lighthouse-seo-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables (see `.env.example` for details)

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Code Style

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Provide proper type definitions
- Avoid `any` types when possible

### React/Next.js

- Use functional components with hooks
- Follow the App Router conventions
- Keep components focused and single-purpose
- Use server components where possible

### Formatting

- Use 2-space indentation
- Use single quotes for strings
- Add trailing commas
- Keep line length under 100 characters

### Naming Conventions

- **Files**: kebab-case for components (`score-card.tsx`), camelCase for utilities (`reports.ts`)
- **Components**: PascalCase (`ScoreCard`)
- **Functions**: camelCase (`getLatestReport`)
- **Constants**: UPPER_SNAKE_CASE (`CACHE_TTL`)
- **Types/Interfaces**: PascalCase (`LighthouseScores`)

## Pull Request Process

### Before Submitting

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Test your changes**:
   - Run the linter: `npm run lint`
   - Run type checking: `npm run typecheck`
   - Run tests: `npm test`
   - Build the project: `npm run build`
   - Run full verification: `npm run verify`
   - Test locally with your changes

3. **Write clear commit messages** and **sign off commits**:
   ```bash
   git commit -s -m "feat: add dark mode toggle"
   git commit -s -m "fix: correct score calculation for accessibility"
   git commit -s -m "docs: update setup instructions"
   ```

   **Important**: All commits must be signed off with `-s` flag (DCO requirement)

### Submitting

1. Push your branch and create a Pull Request

2. Fill out the PR template with:
   - Description of changes
   - Related issue numbers
   - Screenshots (if UI changes)
   - Testing performed

3. Wait for review and address feedback

### Review Criteria

- Code follows the style guidelines
- Changes are well-tested
- Documentation is updated
- No breaking changes without discussion
- Performance impact is considered

## Project Structure

```
/app                  # Next.js App Router pages and API routes
  /api               # API endpoints
  /auth              # Authentication pages
/components          # React components
/lib                 # Utility libraries and types
/scripts             # CLI scripts for CI/CD
/docs                # Documentation
/public              # Static assets
```

## Reporting Issues

### Bug Reports

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (browser, OS, Node version)
- Screenshots or error logs

### Feature Requests

Include:
- Description of the feature
- Use case and motivation
- Potential implementation approach
- Any alternatives considered

## Security

If you discover a security vulnerability, please do NOT open a public issue. Instead, email the maintainers directly with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Questions?

Feel free to open a discussion or issue if you have questions about contributing.

Thank you for helping improve this project!
