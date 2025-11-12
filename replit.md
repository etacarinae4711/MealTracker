# Mealtracker

## Overview
Mealtracker is a minimal, mobile-first Progressive Web App (PWA) designed to track the time elapsed since a user's last meal. It features a clean, intuitive interface with a prominent "Track Meal" button and a real-time timer display. The project prioritizes simplicity, maintainability, and code quality, offering a well-documented, type-safe codebase and an intuitive user experience. Key capabilities include multi-language support (English, German, Spanish), configurable push notifications with quiet hours, and a comprehensive settings page for managing meal history and preferences. The business vision is to provide a highly accessible and user-friendly tool for personal meal tracking, with market potential in health, wellness, and productivity sectors.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes

### 2025-11-12: Settings Page UI Optimization
- **Target Hours Configuration Compacted**:
  - Display size reduced: text-6xl (60px) → text-4xl (36px) for better balance
  - +/- Buttons optimized: h-12 w-12 → h-11 w-11 (44px, mobile-friendly touch targets)
  - Icons proportionally adjusted: h-5 w-5 → h-4 w-4
  - Label compacted: text-sm → text-xs
  - Gap reduced: gap-2 → gap-1
- **Improved Visual Separation**:
  - Card spacing increased: space-y-6 → space-y-8
  - Better visual hierarchy and grouping of settings sections
- **German Translation Refinement**:
  - Target hours label updated: "Ziel-Zeit" → "Zielzeit" (removed hyphen)

### 2025-11-11: Complete UI Refinement & Full Internationalization
- **Timer Display Size Reduction**: Changed from text-5xl md:text-6xl to text-3xl md:text-4xl for better mobile balance
- **Complete Internationalization (100% Coverage)**:
  - Systematic grep audit eliminated ALL hard-coded strings in home.tsx and settings.tsx
  - Extended translations.ts with 30+ new keys covering entire app
  - All toasts, labels, buttons, descriptions use translation system
  - Added minutesShort key for "m" suffix in progress display
- **Settings Page Reorganization**: "Edit Last Meal" card moved to top position
- **Quiet Hours Time-Picker Upgrade**: Replaced number inputs with Select dropdowns (00:00-23:00)

### 2025-11-10: Multi-Language Support & Quiet Hours Implementation
- Complete EN/DE/ES translations via translations.ts
- Language context provider wraps entire app
- Quiet hours feature with database and UI support
- Server-side notification scheduling

## System Architecture

### Core Design Principles
- **Mobile-First & PWA**: Optimized for mobile devices with offline capabilities and push notifications.
- **Minimalist UI**: Apple HIG-inspired design emphasizing clarity and essential functionality.
- **Type-Safety**: Strict TypeScript across the entire codebase.
- **Internationalization**: Full support for English, German, and Spanish with zero hard-coded UI strings.

### Technology Stack
- **Frontend**: React 18+ (TypeScript), Vite, Wouter, shadcn/ui (Radix UI + Tailwind CSS), TanStack Query v5, date-fns.
- **Backend**: Express.js (Node.js), PostgreSQL (Neon), Drizzle ORM, web-push, node-cron.
- **Build & Development**: TypeScript 5.6+, Vite 5.4+, ESBuild, Tailwind CSS 4.1+.

### Feature Specifications
- **Home Page**: "Track Meal" button, real-time timer display (updates every second, color-coded), progress bar, PWA badge updates, auto-registers push notifications.
- **Settings Page**: Card-based layout with sections for: Edit Last Meal, Push Notifications (with permission handling), Target Hours, Quiet Hours (select dropdowns), Language, and History. Toast feedback for actions and full validation with translated error messages.
- **Internationalization**: Complete multilingual support (English, German, Spanish) with all UI text sourced from `translations.ts`. Instant language switching.
- **Push Notifications**: Configurable target-hour reminders, daily morning reminders, and hourly PWA badge updates, respecting user-defined quiet hours.

### System Design Choices
- **Internationalization Architecture**: Uses `translations.ts` as a single source of truth, `LanguageProvider` context, and `useLanguage()` hook for dynamic translation.
- **Centralized State Management**: `use-meal-tracker.ts` for meal-related state (localStorage persistence), `useLanguage()` for global language, and TanStack Query for server state.
- **Utility-First Architecture**: `constants.ts` for all magic numbers, `time-utils.ts` for pure date/time functions, and `push-notifications.ts` for PWA integration.
- **Component Organization**: Pages are presentational; logic resides in hooks and utility modules with clear separation of concerns.
- **Hybrid Storage Approach**:
    - **Client-side (localStorage)**: Primary for meal tracking data and user preferences for offline access.
    - **Server-side (PostgreSQL via Drizzle ORM)**: Persists push subscription data for background notification scheduling.
    - **In-memory (MemStorage)**: Placeholder for future authentication.
- **API Structure**: RESTful endpoints (`/api/push/*`) for push notification management with Zod schema validation.
- **Notification Services**: Three cron jobs (hourly badge, target-hour reminders, daily reminders) handled by `notification-scheduler.ts`.
- **Theming & Styling**: Tailwind CSS with custom design tokens, Apple HIG-inspired minimalist design, mobile-first responsive. No emojis in UI.

## External Dependencies

**Core Runtime:**
- `react` ^18.3.1, `react-dom` ^18.3.1 - UI library
- `typescript` 5.6.3 - Type system
- `wouter` ^3.3.5 - Client-side routing

**UI Component Libraries:**
- `@radix-ui/*` - Headless UI primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, label, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, tooltip, etc.)
- `lucide-react` ^0.453.0 - Icon library
- `react-icons` ^5.4.0 - Additional icon library
- `class-variance-authority` ^0.7.1 - Component variants
- `clsx` ^2.1.1 - Conditional classnames
- `tailwind-merge` ^2.6.0 - Tailwind class merging
- `tailwindcss` ^3.4.17 - Utility-first CSS framework
- `tailwindcss-animate` ^1.0.7 - Animation utilities
- `tw-animate-css` ^1.2.5 - Additional animations

**State Management & Data Fetching:**
- `@tanstack/react-query` ^5.60.5 - Server state management
- `react-hook-form` ^7.55.0 - Form management
- `@hookform/resolvers` ^3.10.0 - Form validation resolvers
- `zod` ^3.24.2 - Schema validation
- `zod-validation-error` ^3.4.0 - Friendly validation error messages

**Date & Time:**
- `date-fns` ^3.6.0 - Date manipulation and formatting

**UI Utilities:**
- `framer-motion` ^11.13.1 - Animation library
- `cmdk` ^1.1.1 - Command menu component
- `input-otp` ^1.4.2 - OTP input component
- `vaul` ^1.1.2 - Drawer component
- `react-day-picker` ^8.10.1 - Date picker
- `react-resizable-panels` ^2.1.7 - Resizable panel layouts
- `embla-carousel-react` ^8.6.0 - Carousel component
- `recharts` ^2.15.2 - Chart library (available but not actively used)
- `next-themes` ^0.4.6 - Theme management

**Backend:**
- `express` ^4.21.2 - HTTP server
- `express-session` ^1.18.1 - Session middleware
- `@neondatabase/serverless` ^0.10.4 - PostgreSQL client for Neon
- `drizzle-orm` ^0.39.1 - Type-safe ORM
- `drizzle-zod` ^0.7.0 - Zod schema integration
- `web-push` ^3.6.7 - Push notification delivery
- `node-cron` ^4.2.1 - Job scheduling
- `ws` ^8.18.0 - WebSocket library
- `connect-pg-simple` ^10.0.0 - PostgreSQL session store
- `memorystore` ^1.6.7 - Memory-based session store

**Authentication (Available, not actively used):**
- `passport` ^0.7.0 - Authentication middleware
- `passport-local` ^1.0.0 - Local authentication strategy

**Build & Development Tools:**
- `vite` ^5.4.20 - Build tool and dev server
- `@vitejs/plugin-react` ^4.7.0 - React plugin for Vite
- `@replit/vite-plugin-cartographer` ^0.4.2 - Replit integration
- `@replit/vite-plugin-dev-banner` ^0.1.1 - Dev banner
- `@replit/vite-plugin-runtime-error-modal` ^0.0.3 - Error modal
- `esbuild` ^0.25.0 - JavaScript bundler
- `tsx` ^4.20.5 - TypeScript executor
- `drizzle-kit` ^0.31.4 - Database migration tool
- `postcss` ^8.4.47 - CSS transformer
- `autoprefixer` ^10.4.20 - CSS autoprefixer
- `@tailwindcss/vite` ^4.1.3 - Tailwind Vite plugin
- `@tailwindcss/typography` ^0.5.15 - Typography plugin

**TypeScript Types:**
- `@types/node` 20.16.11
- `@types/react` ^18.3.11
- `@types/react-dom` ^18.3.1
- `@types/express` 4.17.21
- `@types/express-session` ^1.18.0
- `@types/passport` ^1.0.16
- `@types/passport-local` ^1.0.38
- `@types/web-push` ^3.6.4
- `@types/ws` ^8.5.13
- `@types/connect-pg-simple` ^7.0.3

**Other:**
- `@jridgewell/trace-mapping` ^0.3.25 - Source map support
- `bufferutil` ^4.0.8 (optional) - Performance optimization for WebSockets