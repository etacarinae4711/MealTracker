# Mealtracker Design Guidelines

## Design Approach
**Selected Framework:** Minimal Utility Design (inspired by Apple HIG principles)
- Single-purpose, distraction-free interface
- Maximum readability and instant comprehension
- Clean, centered layout with strong visual hierarchy
- Focus on functional clarity over decorative elements

## Layout System

**Container Strategy:**
- Center all content vertically and horizontally in viewport
- Maximum width: 480px for mobile-first focus
- Padding: p-6 on mobile, p-8 on desktop
- Vertical spacing between major elements: space-y-8

**Spacing Primitives:**
Use Tailwind units of 2, 4, 6, 8, and 12 for consistent rhythm
- Micro spacing (within components): 2, 4
- Component padding: 6, 8
- Section spacing: 8, 12

## Typography

**Font Selection:**
- Primary: 'Inter' from Google Fonts (clean, highly legible)
- Weights: 400 (regular), 600 (semibold), 700 (bold)

**Type Scale:**
- App Title: text-2xl font-bold (desktop), text-xl font-bold (mobile)
- Button Text: text-lg font-semibold
- Timer Display: text-6xl font-bold (desktop), text-5xl font-bold (mobile)
- Timer Label: text-sm font-semibold uppercase tracking-wide
- Helper Text: text-base font-regular

## Core Components

**Track Meal Button:**
- Large, prominent touch target: min-height of 56px
- Rounded: rounded-xl
- Full width on mobile, max-w-xs centered on desktop
- Typography: text-lg font-semibold
- Padding: px-8 py-4
- Clear active/pressed state with slight scale transform (scale-95)

**Last Meal Timer Display:**
- Card-style container with rounded-2xl
- Padding: p-8 on mobile, p-12 on desktop
- Timer format displayed prominently: "00:00" (hours:minutes)
- Label positioned above timer: "Time Since Last Meal"
- Transition between background states: smooth 300ms transition
- Border: subtle 1px border for definition when on green state

**Timer Color States (User Requirement):**
- Red background: 0-3 hours (bg-red-500)
- Green background: 3+ hours (bg-green-500)
- Note: Text must remain highly legible on both backgrounds (white text recommended)

## Visual Hierarchy

1. **Primary Focus:** Track Meal button (largest interactive element)
2. **Secondary Focus:** Timer display (largest text, visually weighted container)
3. **Tertiary:** App title and helper text

**Vertical Flow:**
```
App Title (top, subtle)
↓ (space-y-8)
Track Meal Button (prominent, centered)
↓ (space-y-8)
Timer Display Card (emphasized through size and background)
```

## Interaction Design

**Button States:**
- Default: solid, stable appearance
- Hover: subtle brightness increase
- Active/Pressed: scale-95 transform for tactile feedback
- Disabled (if applicable): reduced opacity

**Timer Animation:**
- Countdown updates every minute
- Background color transition: smooth 300ms ease when switching from red to green
- No distracting animations or movement during countdown

## Responsive Behavior

**Mobile (< 768px):**
- Full-width layout with 24px side margins
- Stacked vertical arrangement
- Touch-friendly button sizes (minimum 48px height)

**Desktop (≥ 768px):**
- Centered card layout, max-width 480px
- Increased spacing for breathing room
- Maintains compact, focused footprint

## Accessibility

- High contrast text on colored backgrounds (WCAG AA minimum)
- Clear focus states for keyboard navigation
- Large, tappable button areas (56px minimum)
- Semantic HTML for screen readers
- ARIA labels for timer state changes

## Page Structure

Single-screen application with no navigation:
- Simple header with app name
- Centered content area with button and timer
- Optional footer with minimal text (e.g., version number)

**No hero images needed** - this is a pure utility interface focused on function over form.