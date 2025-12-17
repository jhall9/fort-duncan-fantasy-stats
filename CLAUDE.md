# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start development server on http://localhost:3000

# Build and Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

This is a Next.js 15 fantasy football league stats viewer using the App Router pattern.

### Key Technologies
- **Next.js 15** with App Router (`/app` directory)
- **TypeScript** for type safety
- **Tailwind CSS** with custom dark mode theme (blue-gray colors)
- **React 19** with client components for interactivity

### Project Structure

**Data Layer** (`/lib/data.ts`):
- Contains all dummy data generation and TypeScript interfaces
- Exports: `leagueName`, `cumulativeRecords`, `yearlyStandings`, `draftPositions`
- Covers 10 teams across 2020-2025 seasons

**Theme System**:
- `ThemeProvider` component wraps the app and manages dark/light mode state
- Uses localStorage for persistence and respects system preferences
- Dark mode uses custom Tailwind colors: `dark-bg` (#1e293b), `dark-surface` (#334155), `dark-border` (#475569)

**Page Routes**:
- `/` - Landing page with league name and overview cards
- `/records` - Cumulative all-time records table
- `/standings` - Year-by-year standings with year picker (client component)
- `/draft` - Draft positions by year with summary view toggle (client component)

**Client Components**:
- Pages with interactivity (`standings/page.tsx`, `draft/page.tsx`) are marked with `'use client'`
- Server components are used for static content (`page.tsx`, `records/page.tsx`)

### Tailwind Configuration
- Dark mode enabled via `class` strategy
- Custom color palette defined for dark theme consistency
- Content paths configured for app directory structure