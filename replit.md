# Mealtracker

## Overview

Mealtracker is a minimal, mobile-first Progressive Web App (PWA) designed to track the time elapsed since a user's last meal. It features a clean, intuitive interface with a prominent "Track Meal" button and a real-time timer display. The project prioritizes simplicity, maintainability, and code quality, offering a well-documented, type-safe codebase and an intuitive user experience. Key capabilities include multi-language support (English, German, Spanish), configurable push notifications with quiet hours, and a comprehensive settings page for managing meal history and preferences. The business vision is to provide a highly efficient and user-friendly tool for meal tracking, enhancing personal health management with minimal friction.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### 2025-11-11: Complete UI Refinement & Full Internationalization
- **Target Hours Label Update**: Changed to more descriptive wording
  - German: "Ziel-Zeit zwischen zwei Mahlzeiten"
  - English: "Target Time Between Meals"
  - Spanish: "Tiempo objetivo entre comidas"

- **Timer Display Size Reduction**: Made timer more compact
  - Changed from text-5xl md:text-6xl to text-3xl md:text-4xl
  - Better visual balance on mobile devices

- **Complete Internationalization (100% Coverage)**:
  - Systematic grep audit eliminated ALL hard-coded strings in home.tsx and settings.tsx
  - Extended translations.ts with 30+ new keys covering entire app
  - All toasts, labels, buttons, descriptions use translation system
  - Added minutesShort key for "m" suffix in progress display
  - Verified via multi-pass regex scans

- **Settings Page Reorganization**:
  - "Edit Last Meal" card moved to top position
  - New order: Edit Last Meal → Notifications → Target Hours → Quiet Hours → Language → History

- **Quiet Hours Time-Picker Upgrade**:
  - Replaced number inputs with Select dropdowns
  - Shows formatted times (00:00 - 23:00)
  - Prevents invalid time entry

### 2025-11-10: Multi-Language Support & Quiet Hours Implementation
- Complete EN/DE/ES translations via translations.ts
- Language context provider wraps entire app
- Quiet hours feature with database and UI support
- Server-side notification scheduling

## System Architecture

### Core Design Principles
- **Mobile-First & PWA**: Optimized for mobile devices, offering offline capabilities and push notifications.
- **Minimalist UI**: Apple HIG-inspired design with a focus on clarity and essential functionality.
- **Type-Safety**: Extensive use of TypeScript across the codebase.
- **Internationalization**: Full support for English, German, and Spanish, with all UI strings externalized.

### Key Design Patterns
- **Internationalization Architecture**: A comprehensive i18n system using `translations.ts` and a `useLanguage()` hook for English, German, and Spanish support. All UI text is sourced from translation keys.
- **Centralized State Hook (`use-meal-tracker.ts`)**: Manages all meal tracking state (last meal timestamp, history, target hours, quiet hours) with automatic localStorage persistence and type-safe operations.
- **Utility Modules**: Pure functions for time operations (`time-utils.ts`), centralized constants (`constants.ts`), and PWA features (`push-notifications.ts`).
- **Component Organization**: Clear separation of concerns with logic in hooks and utilities, and components focused on presentation.

### Frontend Architecture
- **Framework & Build System**: React 18+ with TypeScript, Vite for fast HMR, and Wouter for client-side routing.
- **UI Component System**: shadcn/ui (Radix UI primitives with Tailwind CSS) for a consistent, utility-first styling.
- **Design Philosophy**: Mobile-first responsive design, Apple HIG-inspired minimalism, Inter font family, and consistent spacing.
- **State Management**: `use-meal-tracker` for meal-related state, `useLanguage` for global language state (both persisted in localStorage), and TanStack Query for server state.
- **Internationalization**: Complete multilingual support with zero hard-coded UI strings, managed via `LanguageProvider` and `translations.ts`.
- **Page Architecture**:
    - **Home Page**: Features a "Track Meal" button, real-time timer display with progress bar, and local PWA badge updates.
    - **Settings Page**: Card-based layout for editing last meal, push notifications, target hours, quiet hours (with select-based time pickers), language selection, and meal history.

### Backend Architecture
- **Server Framework**: Express.js with Node.js and custom Vite middleware.
- **API Structure**: RESTful API for push notification management (`/api/push/subscribe`, `/api/push/unsubscribe`, etc.) with Zod validation.
- **Notification Services**: `node-cron` based scheduling for hourly badge updates, target-hour reminders, and daily morning reminders. All notifications respect user-defined quiet hours.
- **Storage Abstraction**: Interface-based design (`server/storage.ts`) for database operations, implemented with PostgreSQL via Drizzle ORM.

### Data Storage Solutions
- **Client-Side Storage (localStorage)**: Stores `lastMealTime`, `mealHistory`, `targetHours`, `quietHours`, and `language`.
- **Database (PostgreSQL)**: `pushSubscriptions` table stores subscription details, `lastMealTime` for scheduling, and user-specific quiet hours. Drizzle ORM is used for type-safe queries.

## External Dependencies

- **UI Component Libraries**: `@radix-ui/*`, Lucide React, `shadcn/ui`
- **Date/Time Utilities**: `date-fns`
- **Form Management**: `react-hook-form`, `@hookform/resolvers`
- **Database & ORM**: `@neondatabase/serverless` (PostgreSQL), `drizzle-orm`, `drizzle-zod`
- **Styling**: Tailwind CSS, `class-variance-authority`, `clsx`, `tailwind-merge`
- **Scheduling**: `node-cron`
- **Push Notifications**: `web-push`
- **Development Tools**: TypeScript, Vite, ESBuild, PostCSS, Autoprefixer