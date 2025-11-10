# Mealtracker

## Overview

Mealtracker is a minimal, mobile-first Progressive Web App (PWA) designed to track the time elapsed since a user's last meal. The app features a clean interface with a prominent "Track Meal" button (teal color with 3D effect) and a real-time timer display. Built with a focus on simplicity, maintainability, and code quality, it provides an intuitive user experience while maintaining a well-documented, type-safe codebase.

## Recent Changes (2025-11-10)

### Multi-Language Support & Quiet Hours Implementation
- **Multi-Language System**: Complete EN/DE/ES translations via translations.ts
  - Language context provider wraps entire app (App.tsx with LanguageProvider)
  - useLanguage hook provides translation keys and language switching
  - Language selector card in Settings page
  - All critical user-facing strings now use t.* translation keys
  
- **Quiet Hours Feature**: Configurable notification quiet periods
  - Database schema extended with quietHoursStart/End columns (pushSubscriptions table)
  - Constants.ts with QUIET_HOURS_CONFIG (default 22:00-08:00)
  - use-meal-tracker hook manages quiet hours state and localStorage persistence
  - Settings page includes Quiet Hours card with start/end time inputs
  - Quiet hours stored in localStorage and ready for backend sync
  
- **Translation Coverage**: All toasts and validation messages now translated
  - handleToggleNotifications: Uses t.notificationsEnabled/Disabled/Error
  - handleSaveTargetHours: Uses t.minimumMealIntervalValidation
  - handleSaveQuietHours: Uses t.quietHoursValidation
  - No hard-coded strings in critical handlers

### Feature Complete Refactoring
- **Code Organization**: Extracted shared logic into reusable modules
  - `client/src/lib/constants.ts` - Centralized configuration values
  - `client/src/lib/time-utils.ts` - Time formatting and calculation utilities
  - `client/src/types/meal-tracker.ts` - TypeScript type definitions
  - `client/src/hooks/use-meal-tracker.ts` - Custom hook for meal state management
  
- **Documentation**: Added comprehensive JSDoc comments throughout codebase
  - Every function documented with purpose, parameters, and examples
  - Module-level documentation explaining architecture decisions
  - Inline comments for complex logic and side effects
  
- **Dedicated Settings Page**: Created `/settings` route consolidating all configuration
  - Push notification management
  - Target hours configuration with +/- controls
  - Last meal editing functionality
  - Complete meal history viewer
  
- **Simplified Homepage**: Focused on core meal tracking functionality
  - Prominent "Track Meal" button with 3D effect
  - Real-time timer with progress visualization
  - Settings access via icon button

## User Preferences

Preferred communication style: Simple, everyday language.

## Code Architecture

### File Structure

```
client/src/
├── components/        # Shadcn UI components
├── hooks/            # Custom React hooks
│   └── use-meal-tracker.ts  # Centralized meal state management
├── lib/              # Utility libraries
│   ├── constants.ts         # App-wide constants (storage keys, time values, config)
│   ├── time-utils.ts        # Time formatting and calculation functions
│   ├── push-notifications.ts # Push API and service worker management
│   └── queryClient.ts       # TanStack Query configuration
├── pages/            # Route components
│   ├── home.tsx            # Main tracking interface
│   └── settings.tsx        # Settings and configuration
└── types/            # TypeScript definitions
    └── meal-tracker.ts    # Shared type definitions and type guards
```

### Key Design Patterns

**Custom Hook Pattern (`use-meal-tracker.ts`)**
- Encapsulates all meal tracking logic and localStorage persistence
- Provides clean API: `trackMeal()`, `updateLastMealTime()`, `updateTargetHours()`
- Handles data validation and sanitization
- Ensures single source of truth for meal state

**Utility Modules**
- `constants.ts`: Eliminates magic numbers and centralizes configuration
- `time-utils.ts`: Pure functions for time operations, easily testable
- Type guards in `meal-tracker.ts` for runtime type safety

**Component Organization**
- Pages are presentational, logic delegated to hooks and utilities
- Effect hooks clearly documented with their purpose and dependencies
- Event handlers named descriptively: `handleTrackMeal`, `handleSaveTargetHours`

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component System:**
- shadcn/ui component library (Radix UI primitives with Tailwind CSS styling)
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming support

**Design Philosophy:**
- Mobile-first responsive design with maximum width of 480px
- Apple HIG-inspired minimal utility design emphasizing clarity
- Inter font family for optimal legibility
- Consistent spacing system using Tailwind units
- No emojis in UI (design guideline requirement)

**State Management:**
- Custom hooks (`use-meal-tracker`) for centralized state logic
- TanStack Query for server state management
- Browser localStorage for persistent data (meals, settings)

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- Node.js runtime with ESM module support
- Custom Vite middleware integration for development with HMR

**API Structure:**
- RESTful API pattern with `/api` prefix
- Push notification endpoints: `/api/push/*`
- Modular route registration in `server/routes.ts`

### Data Storage Solutions

**Client-Side Storage (localStorage):**
- `lastMealTime`: Unix timestamp of most recent meal
- `mealHistory`: Array of meal entries with timestamps and UUIDs
- `targetHours`: User's goal interval (1-24, default 3)
- Validation on load prevents corrupt data

**Database (PostgreSQL):**
- Push subscriptions table storing endpoint, keys, and last meal time
- Drizzle ORM for type-safe queries
- Migrations via `drizzle-kit`

**Push Notifications & Badge System:**
- PWA app badge displays hours elapsed (0-99 maximum)
- Local badge updates every minute (checks for hour changes)
- Server-side hourly push notifications for background updates
- Target-hour reminder notifications
- Daily 9 AM reminder notifications

### Code Quality & Maintainability

**TypeScript Best Practices:**
- Strict type checking enabled
- Shared interfaces in `types/meal-tracker.ts`
- Type guards for runtime validation (`supportsBadgeAPI`)
- No `any` types used

**Documentation Standards:**
- JSDoc comments on all exported functions
- Module-level documentation explaining purpose
- Parameter and return type documentation
- Usage examples in documentation
- Comments explaining complex logic and side effects

**Constants & Configuration:**
- All magic numbers extracted to `constants.ts`
- Configuration objects with descriptive names
- `as const` assertions for type safety
- Clear organization by category (storage, time, badge, etc.)

**Testing Considerations:**
- Pure utility functions in `time-utils.ts` easily unit testable
- Components use dependency injection (hooks) for testability
- Clear separation of concerns (UI, logic, persistence)
- Comprehensive `data-testid` attributes for E2E testing

### External Dependencies

**UI Component Libraries:**
- @radix-ui/* primitives for accessible components
- Lucide React for consistent icon set
- date-fns for date/time formatting

**Form Management:**
- @hookform/resolvers for validation
- React Hook Form integration

**Database & ORM:**
- @neondatabase/serverless for PostgreSQL
- drizzle-orm and drizzle-zod for type-safe database operations

**Development Tools:**
- TypeScript for static type checking
- ESBuild for production builds
- PostCSS with Autoprefixer

**Styling:**
- Tailwind CSS with custom configuration
- class-variance-authority for component variants
- clsx and tailwind-merge for conditional classes

## Development Guidelines

**When Adding New Features:**
1. Add constants to `constants.ts` if introducing configuration
2. Create utility functions in appropriate `lib/` file
3. Update types in `types/meal-tracker.ts`
4. Add comprehensive JSDoc documentation
5. Use existing hooks and utilities instead of duplicating logic

**Code Style:**
- Descriptive variable and function names
- Extract magic numbers to constants
- Document complex logic with comments
- Group related functionality together
- Keep components focused and single-purpose

**Type Safety:**
- Define interfaces for all data structures
- Use type guards for runtime checks
- Leverage TypeScript's strict mode
- Avoid type assertions unless necessary
