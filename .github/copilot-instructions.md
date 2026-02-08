# Copilot Instructions for HigherLower

## Project Overview

HigherLower is a multiplayer "Higher or Lower" game built with modern web technologies. This repository contains multiple front-end design concepts showcasing different visual approaches to the game interface.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **React**: 19.2.3
- **TypeScript**: 5.x (strict mode enabled)
- **Styling**: Tailwind CSS 4.x
- **Linting**: ESLint with Next.js configuration

## Architecture & Project Structure

- `/src/app/` - Next.js App Router pages and layouts
- `/src/app/opus-[1-5]/` - Individual design concept implementations
- `/public/` - Static assets
- Root configuration files: `tsconfig.json`, `eslint.config.mjs`, `next.config.ts`

## Coding Standards & Conventions

### TypeScript

- **Strict Mode**: Always enabled. Do not disable strict type checking.
- **Type Safety**: Avoid using `any` type unless absolutely necessary and justified with a comment.
- **Imports**: Use the `@/` path alias for imports from the `src` directory (e.g., `import Component from "@/components/Button"`).
- **React Types**: Import types from `next`, `react`, and specific libraries (e.g., `import type { Metadata } from "next"`).
- **Type Exports**: Use `export type` for type-only exports.

### React & Next.js

- **Components**: Use functional components with TypeScript.
- **Server Components**: Default to React Server Components; use `"use client"` directive only when needed (for interactivity, hooks, browser APIs).
- **Metadata**: Define page metadata using the `metadata` export in pages and layouts.
- **File Naming**: Use lowercase with hyphens for directories, and PascalCase for component files when appropriate.

### Styling

- **Tailwind CSS**: Prefer Tailwind utility classes for styling.
- **Inline Styles**: Currently used in some design concepts (see `/src/app/page.tsx`). For new features, prefer Tailwind classes unless maintaining consistency with existing inline-styled components.
- **CSS Files**: Global styles go in `src/app/globals.css`.

### Code Quality

- **Linting**: Run `npm run lint` before committing. Fix all linting errors.
- **Building**: Run `npm run build` to ensure the app builds successfully.
- **Formatting**: Follow the existing code style. Be consistent with indentation (2 spaces), quotes (double quotes preferred in JSX/TSX).

## Development Workflow

### Commands

- `npm run dev` - Start the development server on `http://localhost:3000`
- `npm run build` - Build the production application
- `npm start` - Start the production server
- `npm run lint` - Run ESLint

### Making Changes

1. **Understand Context**: Review existing code patterns before implementing new features.
2. **Maintain Consistency**: Match the style and patterns of existing code, especially within the same design concept.
3. **Test Locally**: Always run the dev server and manually test changes in the browser.
4. **Lint & Build**: Run `npm run lint` and `npm run build` before finalizing changes.
5. **Minimal Changes**: Make surgical, focused changes. Don't refactor unrelated code.

## Design Concepts

This repository showcases five distinct visual designs:

1. **Aurora Glass** (`/opus-1`) - Glassmorphism with aurora borealis aesthetic
2. **Retro Arcade** (`/opus-2`) - Neon cyberpunk theme
3. **Minimal Zen** (`/opus-3`) - Japanese-inspired minimalism
4. **Playful Shapes** (`/opus-4`) - Vibrant, joyful design
5. **Dark Luxury** (`/opus-5`) - Refined dark theme with gold accents

When modifying or creating design concepts, maintain the unique visual identity of each theme.

## Best Practices

- **Type Safety First**: Leverage TypeScript's type system fully. Prefer interfaces over type aliases for object shapes.
- **Performance**: Be mindful of bundle size. Avoid unnecessary client-side JavaScript.
- **Accessibility**: Ensure interactive elements are keyboard-accessible and have appropriate ARIA labels.
- **Responsive Design**: Test designs across different screen sizes.
- **Git Hygiene**: Write clear, concise commit messages. Keep commits focused and atomic.

## What to Avoid

- Don't disable TypeScript strict mode or type checking
- Don't add `any` types without justification
- Don't introduce new dependencies without considering bundle size impact
- Don't modify working tests or remove existing functionality without good reason
- Don't mix styling approaches (e.g., don't add CSS modules if the project uses Tailwind)
- Don't ignore linting errors

## Questions & Guidance

If you're unsure about an implementation approach:
1. Check similar patterns in existing code
2. Follow Next.js 16 and React 19 best practices
3. Prioritize user experience and performance
4. When in doubt, ask for clarification rather than making assumptions
