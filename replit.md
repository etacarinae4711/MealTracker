# Mealtracker

## Overview

Mealtracker is a minimal, mobile-first web application designed to track the time elapsed since a user's last meal. The app features a clean, centered interface with a prominent "Track Meal" button (teal color with 3D effect) and a real-time timer display showing hours and minutes since the last meal was logged. Built with a focus on simplicity and readability, it stores meal timestamps in browser localStorage for persistence across sessions.

## Recent Changes (2025-11-09)

- Implemented configurable target hours (1-24h range) via Settings dialog with +/- buttons
- Added visual progress bar showing percentage to target goal
- Enhanced Track Meal button with 3D gradient effect and press animation
- Badge notifications now display hours elapsed (1-99) instead of just "1"
- Target hours stored in localStorage with validation against corrupt values
- Intuitive number picker interface (large display + round +/- buttons) for settings

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, providing fast HMR (Hot Module Replacement)
- Wouter for client-side routing (lightweight alternative to React Router)

**UI Component System:**
- shadcn/ui component library (Radix UI primitives with Tailwind CSS styling)
- "New York" style variant with custom neutral base color scheme
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming support (light/dark modes)

**Design Philosophy:**
- Mobile-first responsive design with maximum width of 480px for focused content
- Apple HIG-inspired minimal utility design emphasizing clarity and single-purpose interactions
- Inter font family (400, 600, 700 weights) for optimal legibility
- Consistent spacing system using Tailwind units (2, 4, 6, 8, 12)
- Centered layout strategy with strong visual hierarchy

**State Management:**
- TanStack Query (React Query) for server state management and data fetching
- React hooks for local component state
- Browser localStorage for persistent meal timestamp storage

### Backend Architecture

**Server Framework:**
- Express.js as the HTTP server framework
- Node.js runtime with ESM module support
- Custom Vite middleware integration for development with HMR

**Request Handling:**
- JSON body parsing with raw body capture for webhook/signature verification scenarios
- Express middleware for logging API requests (filtered to /api routes)
- Session management capability via connect-pg-simple (PostgreSQL session store)

**API Structure:**
- RESTful API pattern with `/api` prefix for all application routes
- Modular route registration system (currently minimal starter implementation)
- Storage interface pattern for data access abstraction

### Data Storage Solutions

**Database:**
- PostgreSQL as the primary database (via Neon serverless driver)
- Drizzle ORM for type-safe database queries and schema management
- Migration system using drizzle-kit with migrations stored in `/migrations` directory

**Schema Design:**
- User table with UUID primary keys (generated via PostgreSQL `gen_random_uuid()`)
- Drizzle-Zod integration for runtime validation of insert/select operations

**Client-Side Storage:**
- LocalStorage for persisting meal timestamps without requiring backend authentication
- LocalStorage for user settings (targetHours: 1-24 range, default 3)
- Validation on load: sanitizes corrupt/invalid values (defaults to 3)
- Enables offline-first user experience for core meal tracking functionality

**Push Notifications & Badge System:**
- App badge displays hours elapsed since last meal (1-99 hours maximum)
- Hourly silent push updates badge count automatically
- Badge resets to 0 when tracking new meal (instant local + background push)
- Target-hour reminder notifications with badge count
- Daily 9 AM reminder notifications

### External Dependencies

**UI Component Libraries:**
- @radix-ui/* primitives (accordion, dialog, dropdown-menu, select, tabs, toast, tooltip, etc.)
- Lucide React for consistent icon set
- cmdk for command palette functionality
- embla-carousel-react for carousel components
- date-fns for date/time formatting and manipulation

**Form Management:**
- @hookform/resolvers for validation schema integration
- React Hook Form (implied by resolvers package)

**Database & ORM:**
- @neondatabase/serverless for PostgreSQL database connectivity
- drizzle-orm and drizzle-zod for ORM and schema validation
- connect-pg-simple for PostgreSQL-backed session storage

**Development Tools:**
- TypeScript for static type checking
- Replit-specific plugins for development environment integration
- ESBuild for production server bundling
- PostCSS with Autoprefixer for CSS processing

**Styling:**
- Tailwind CSS with custom configuration
- class-variance-authority for variant-based component styling
- clsx and tailwind-merge for conditional class composition