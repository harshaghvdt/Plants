# Overview

This is PlantLife - a full-stack plant social network application built with React, TypeScript, and Express.js. Originally a Twitter clone, it has been completely transformed into a botanical community platform where plant enthusiasts share care experiences, growth stories, and cultivate knowledge together. The application features Material Design 3's expressive design language with a nature-inspired botanical theme, avoiding copyright issues while providing an authentic plant community experience.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom Twitter-like design tokens and responsive utilities
- **Real-time Communication**: WebSocket integration for live updates of tweets, likes, and follows

## Backend Architecture
- **Server Framework**: Express.js with TypeScript for RESTful API endpoints
- **Development Server**: Vite in development mode with hot module replacement
- **API Structure**: RESTful endpoints organized by resource (tweets, users, auth, etc.)
- **Error Handling**: Centralized error middleware with proper HTTP status codes
- **WebSocket Server**: Real-time bidirectional communication for live updates

## Database & ORM
- **Database**: PostgreSQL with Neon serverless driver for cloud deployment  
- **ORM**: Drizzle ORM with TypeScript schema definitions for type-safe database operations
- **Schema**: Plant community schema including users, posts (formerly tweets), follows, likes, shares (formerly retweets), and notifications tables
- **Migrations**: Drizzle Kit for database schema migrations and management
- **Schema Transformation**: Successfully migrated from Twitter terminology (tweets, retweets) to plant terminology (posts, shares)

## Authentication & Sessions
- **Authentication Provider**: Replit Auth using OpenID Connect (OIDC) for secure user authentication
- **Session Management**: Express sessions with PostgreSQL store using connect-pg-simple
- **Security**: HTTP-only cookies with secure flags and session timeout handling
- **Authorization**: Middleware-based route protection for authenticated endpoints

## External Dependencies

- **Database Hosting**: Neon PostgreSQL for serverless database hosting
- **Authentication Service**: Replit Auth OIDC provider for user authentication
- **Development Tools**: Replit-specific plugins for development environment integration
- **UI Framework**: Radix UI for accessible component primitives
- **Styling**: Tailwind CSS for utility-first styling approach
- **Font Loading**: Google Fonts integration for typography (Inter, DM Sans, Architects Daughter, etc.)
- **Real-time**: Native WebSocket API for bidirectional communication
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Date Utilities**: date-fns for relative time formatting and date manipulation