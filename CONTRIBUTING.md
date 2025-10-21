# 🤝 Contributing to ShareSkippy

Thank you for wanting to contribute to ShareSkippy! This guide will help you understand our workflow and standards. Don't worry if you're new to contributing to open source projects - we'll walk you through everything! 🌟

## 📖 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Getting Help](#getting-help)

## 🌈 Code of Conduct

Be kind, respectful, and constructive in all interactions. We're all here to learn and build something great together!

## 🚀 Getting Started

1. **Read the [README.md](./README.md)** - Set up your environment first
2. **Check the [Issue Tracker](../../issues)** - Find something to work on
3. **Ask questions** - Don't be shy! We're here to help

### Finding Something to Work On

- Look for issues labeled `good first issue` - perfect for beginners!
- Issues labeled `help wanted` - we'd love your help on these
- Have an idea? Create an issue to discuss it first!

## 🔄 Development Workflow

### 1. Fork & Clone (First Time Only)

If you're an external contributor:

```bash
# Fork the repo on GitHub first, then:
git clone https://github.com/YOUR_USERNAME/ShareSkippy.git
cd ShareSkippy
git remote add upstream https://github.com/ORIGINAL_OWNER/ShareSkippy.git
```

If you're a team member, just clone directly:

```bash
git clone https://github.com/YOUR_ORG/ShareSkippy.git
cd ShareSkippy
```

### 2. Create a Branch

**Always** create a new branch for your work:

```bash
# Make sure you're on main and it's up to date
git checkout main
git pull origin main

# Create a new branch with a descriptive name
git checkout -b feature/add-dark-mode
```

**Branch Naming Convention:**

- `feature/description` - for new features
- `fix/description` - for bug fixes
- `docs/description` - for documentation
- `refactor/description` - for code refactoring
- `test/description` - for adding tests

**Examples:**

- `feature/user-profile-page`
- `fix/login-button-alignment`
- `docs/update-readme`
- `test/add-header-tests`

### 3. Make Your Changes

- Write clean, readable code
- Follow our [Coding Standards](#coding-standards)
- Add tests for new features
- Update documentation if needed

### 4. Test Your Changes

Before committing, **always** run:

```bash
# Run all quality checks
npm run validate
```

This runs:

- ✅ Prettier (code formatting)
- ✅ ESLint (code quality)
- ✅ TypeScript (type checking)
- ✅ Jest (tests)

**All checks must pass** before you can create a PR!

### 5. Commit Your Changes

```bash
# Stage your changes
git add .

# Commit with a clear message (see commit guidelines below)
git commit -m "feat: add dark mode toggle"
```

**Note:** Pre-commit hooks will automatically run linting and formatting!

### 6. Push and Create a Pull Request

```bash
# Push your branch to GitHub
git push origin feature/add-dark-mode
```

Then on GitHub:

1. Click "Compare & pull request"
2. Fill out the PR template
3. Link any related issues
4. Request a review

## 📝 Coding Standards

### General Principles

1. **Write code for humans** - Code is read more than it's written
2. **Keep it simple** - Simple code is better than clever code
3. **Be consistent** - Follow the patterns you see in the codebase
4. **Comment when necessary** - Explain "why", not "what"

### JavaScript/TypeScript Style

We use ESLint and Prettier to enforce style automatically. Key points:

```javascript
// ✅ Good: Clear, descriptive names
const getUserProfile = async (userId) => {
  const profile = await fetchProfile(userId);
  return profile;
};

// ❌ Bad: Unclear abbreviations
const getUP = async (uid) => {
  const p = await fP(uid);
  return p;
};

// ✅ Good: Use TypeScript types
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ Good: Destructure props
const UserCard = ({ name, email }) => {
  return <div>...</div>;
};

// ❌ Bad: Using props object directly
const UserCard = (props) => {
  return <div>{props.name}</div>;
};
```

### React Component Guidelines

```javascript
// ✅ Good: Component structure
import { useState } from 'react';

/**
 * UserProfile displays user information and allows editing
 * @param {Object} props
 * @param {User} props.user - The user to display
 * @param {Function} props.onUpdate - Callback when profile is updated
 */
const UserProfile = ({ user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
    // Implementation...
  };

  return <div>{/* Component content */}</div>;
};

export default UserProfile;
```

### File Naming

- Components: `PascalCase.js` (e.g., `UserProfile.js`)
- Utilities: `camelCase.js` (e.g., `formatDate.js`)
- Tests: `ComponentName.test.js` (e.g., `UserProfile.test.js`)
- Hooks: `useCamelCase.js` (e.g., `useAuth.js`)

### Folder Structure

```
app/              # Next.js pages and routes
components/       # Reusable React components
  ├── ui/        # Generic UI components (buttons, inputs, etc.)
  └── ...        # Feature-specific components
hooks/           # Custom React hooks
lib/             # TypeScript utilities
libs/            # JavaScript utilities and services
  ├── supabase/  # Supabase client and utilities
  ├── email/     # Email sending logic
  └── ...
contexts/        # React contexts
__tests__/       # Test files
```

## 💬 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) for clear commit history:

### Format

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, no logic change)
- `refactor:` - Code refactoring (no feature change or bug fix)
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks (dependencies, config, etc.)
- `perf:` - Performance improvements

### Examples

```bash
# Good commits
feat: add user profile editing
fix: resolve login redirect loop
docs: update API documentation
test: add tests for user authentication
refactor: simplify email sending logic
chore: update dependencies

# Commits with scope
feat(auth): add password reset functionality
fix(ui): correct button alignment on mobile
test(api): add integration tests for user endpoints

# Commit with body
feat: add dark mode support

Implemented dark mode toggle in settings page.
Uses system preference as default. Persists user
preference in local storage.

Closes #123
```

### Breaking Changes

If your change breaks existing functionality:

```bash
feat!: change API response structure

BREAKING CHANGE: User API now returns nested profile object
instead of flat structure. Update client code accordingly.
```

## 🔍 Pull Request Process

### Before Creating a PR

- ✅ All tests pass: `npm test`
- ✅ Code is formatted: `npm run format`
- ✅ No lint errors: `npm run lint`
- ✅ Types check: `npm run typecheck`
- ✅ All these at once: `npm run validate`

### PR Title

Use the same format as commit messages:

```
feat: add user profile editing
fix: resolve login redirect loop
docs: update contributing guidelines
```

### PR Description

Fill out the PR template completely:

1. **What** - What does this PR do?
2. **Why** - Why is this change needed?
3. **How** - How does it work?
4. **Testing** - How did you test this?
5. **Screenshots** - If UI changes, include before/after

### PR Checklist

Before submitting:

- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] I have checked my code for security issues

### CI Checks

Your PR **must pass** all CI checks:

- ✅ Linting
- ✅ Type checking
- ✅ Tests
- ✅ Build

If CI fails, fix the issues and push again. The PR **cannot be merged** until all checks pass.

### Code Review

- Be patient - reviews may take a day or two
- Address all feedback
- Ask questions if feedback is unclear
- Don't take criticism personally - we're all learning!

### After Approval

Once approved:

1. Make sure your branch is up to date with main
2. Squash commits if requested
3. The maintainer will merge your PR

## 🧪 Testing

### Writing Tests

Every feature should have tests. We use Jest and React Testing Library.

```javascript
// __tests__/components/Button.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByText('Click me')).toBeDisabled();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (great for TDD!)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a specific test file
npm test Button.test.js
```

### Test Coverage

We aim for:

- **80%+** line coverage for new code
- **100%** coverage for critical paths (auth, payments, etc.)

## 🆘 Getting Help

Stuck? Need clarification? We're here to help!

### Where to Ask

1. **GitHub Discussions** - For general questions
2. **Issue Comments** - For questions about specific issues
3. **PR Comments** - For feedback on your PR
4. **Team Chat** - For quick questions (if you're a team member)

### What to Include

When asking for help:

- What you're trying to do
- What you've tried so far
- What's not working (error messages, screenshots)
- Your environment (OS, Node version, etc.)

## 🎉 Recognition

All contributors will be:

- Added to our README contributors section
- Mentioned in release notes
- Given our eternal gratitude! 💖

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro)

---

**Thank you for contributing to ShareSkippy! Every contribution, no matter how small, makes a difference.** 🚀

Questions? Feel free to ask! We're a friendly bunch. 😊
