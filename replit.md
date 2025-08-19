# Overview

OrthoCare is a medical practice management system designed specifically for orthopedic clinics. The application provides comprehensive management of appointments, patients, doctors, clinic rooms, and insurance plans. Built as a full-stack web application, it offers a modern, responsive interface for healthcare administrators to efficiently manage their practice operations.

The system focuses on orthopedic specialties including sports medicine, joint replacement, spine surgery, and other orthopedic sub-specialties. It includes features for patient registration, appointment scheduling, doctor management, room allocation, and insurance plan administration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built with React 18 using TypeScript and follows a modern component-based architecture. The application uses Vite as the build tool and development server, providing fast hot module replacement and optimized builds.

**UI Framework**: The interface is built with shadcn/ui components based on Radix UI primitives, providing accessible and customizable components. Tailwind CSS handles styling with a custom design system focused on medical/healthcare aesthetics using blue and green color schemes.

**State Management**: TanStack Query (React Query) manages server state, caching, and data synchronization. Form state is handled by React Hook Form with Zod validation schemas for type-safe form validation.

**Routing**: Uses Wouter for lightweight client-side routing, supporting navigation between different sections (Dashboard, Appointments, Patients, Doctors, Rooms, Insurance).

**Component Structure**: Organized into logical folders with reusable UI components, form components for data entry, and page components for different application sections.

## Backend Architecture
The server follows a REST API architecture built with Express.js and TypeScript. The application uses ESM modules throughout for modern JavaScript support.

**API Design**: RESTful endpoints organized by resource (doctors, patients, appointments, etc.) with full CRUD operations. Each endpoint includes proper validation using Zod schemas and consistent error handling.

**File Structure**: Clean separation between route definitions, business logic, and data access layers. The storage layer uses an interface pattern to abstract database operations.

**Development Setup**: Integrated Vite development server with Express middleware in development mode, providing seamless full-stack development experience.

## Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database operations and migrations.

**Database Schema**: Well-structured relational design with tables for doctors, patients, clinic rooms, insurance plans, appointment types, and appointments. Includes proper foreign key relationships and data validation at the database level.

**ORM Integration**: Drizzle provides compile-time type safety and generates TypeScript types from the database schema. Schema definitions include validation rules and default values.

**Migration Strategy**: Database schema changes are managed through Drizzle migrations with a dedicated configuration file for different environments.

## Authentication and Authorization
The current implementation appears to be designed for internal clinic use and does not include authentication mechanisms. The system assumes trusted internal access, which is common for practice management systems used within secure clinic environments.

## External Dependencies
**Database**: Neon Database (serverless PostgreSQL) for cloud-hosted database with automatic scaling
**UI Components**: Radix UI primitives for accessible, unstyled components
**Form Handling**: React Hook Form with Hookform Resolvers for form validation
**Validation**: Zod for runtime type validation and schema generation
**Styling**: Tailwind CSS for utility-first styling approach
**Date Handling**: date-fns for date manipulation and formatting
**Build Tools**: Vite for fast development and optimized production builds
**Development**: TSX for TypeScript execution and hot reloading in development

The architecture prioritizes type safety, developer experience, and maintainability while providing a robust foundation for healthcare practice management.